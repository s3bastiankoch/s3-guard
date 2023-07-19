import { DataFrame } from "data-forge";

export type TabularTransformer = {
  input: string[];
  key: "tabular.allow_columns";
};

export function transformTabular(
  data: DataFrame,
  transformers: TabularTransformer[]
) {
  // Empty dataframe
  let transformed = new DataFrame();

  for (const { key, input } of transformers) {
    switch (key) {
      case "tabular.allow_columns":
        // Add allowed columns to the transformed dataframe
        transformed = transformed.merge(data.subset(input)) as DataFrame;
        break;
      default:
        break;
    }
  }

  return transformed;
}
