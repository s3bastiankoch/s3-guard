import { minimatch } from "minimatch";
import { Config, Rule } from "../cli/schema";
import { S3Client } from "@aws-sdk/client-s3";
import { Transformer } from "./transformers";
import { transformTabular } from "./transformers/tabular";
import { DataFrame } from "data-forge";

export type Dict = Record<string, string | number | boolean>;

export function findRelevantRules(
  rules: Rule[],
  { key, meta = {} }: { key?: string; meta?: Dict }
) {
  return rules.filter(({ match: { paths, metadata } }) => {
    // Match paths
    if (key && paths?.some((path) => minimatch(key, path))) {
      return true;
    }

    // Match metadata
    return Object.entries(metadata || {}).some(
      ([key, value]) => meta[key] === value
    );
  });
}

export type ReadPoliciesOptions = {
  paths: string[];
  Bucket: string;
  s3: S3Client;
};

export type EvaluationContext = {
  // TODO
  data: {
    key?: string;
  };
  input: Dict;
  endpioint: string;
  responseData: unknown;
};

type ExtractEvaluationInputOptions = {
  body?: { policies__input?: Dict } | Record<string, unknown>;
  urlParams: URLSearchParams;
};

// TODO
export function extractEvaluationInput({
  body,
  urlParams,
}: ExtractEvaluationInputOptions): [
  EvaluationContext["input"],
  BodyInit | undefined
] {
  const inputData: Dict = {};

  if (body && "policies__input" in body) {
    Object.entries(body.policies__input || {}).forEach(([key, value]) => {
      inputData[key] = value;
    });
    delete body.policies__input;
  }

  urlParams.forEach((value, key) => {
    if (key.startsWith("p_")) {
      inputData[key.slice(2)] = value;
    }
  });

  return [inputData, body ? JSON.stringify(body) : undefined];
}

export async function evaluatePolicy(
  { entrypoint }: Config["rules"][0]["policy"],
  { input, endpioint, responseData }: EvaluationContext
) {
  try {
    const response = await fetch(`${endpioint}/v1/data/${entrypoint}`, {
      method: "POST",
      body: JSON.stringify({ input }),
    });

    // Evaluate the policy
    const { result } = (await response.json()) as
      | { result: boolean }
      | { result: Record<string, boolean | Transformer[]> };

    if (!result) {
      return { result: false, responseData: null };
    }

    // Simple boolean result
    if (typeof result === "boolean") {
      return { result, responseData };
    }

    // Dict of results
    const allResults: boolean[] = [];

    for (const value of Object.values(result)) {
      if (typeof value === "boolean") {
        allResults.push(value);
      }
    }

    if (!allResults.every((val) => val)) {
      return {
        result: false,
        responseData: null,
      };
    }

    // Apply transformers

    const purpose = input["purpose"] as string | undefined;

    if (purpose) {
      const transformers = result[purpose];

      if (typeof transformers === "boolean") {
        return {
          result: transformers,
          responseData,
        };
      }

      responseData = transformTabular(responseData as DataFrame, transformers);

      return {
        result: true,
        responseData,
      };
    }

    return {
      result: allResults.every((val) => val),
      responseData,
    };
  } catch (err) {
    console.error(err);
    return { result: false, responseData: null };
  }
}
