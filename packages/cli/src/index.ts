#!/usr/bin/env node
import "dotenv/config";
import yargs from "yargs";
import path from "path";
import { readFile } from "fs/promises";

import { readConfig } from "./config";
import { env } from "./env";
import { uploadConfig, uploadPolicy } from "./http";

const CLI_VERSION = "0.0.1";

const main = async () => {
  console.log(`You are running CLI version ${CLI_VERSION}`);

  const { config: configPath } = await yargs(process.argv.slice(2))
    .version(CLI_VERSION)
    .option("config", {
      describe: "specify path to the config file",
      type: "string",
    })
    .default("config", "config.yml")
    .help().argv;

  // Read config.yaml
  const { dir: configDir } = path.parse(configPath);
  const config = await readConfig(path.join(process.cwd(), configPath));

  for (const { policy } of config.rules) {
    const { name } = path.parse(policy.file);

    // Read policy file
    const policyCode = await readFile(
      path.join(configDir, policy.file),
      "utf-8"
    );

    const isSuccess = await uploadPolicy({
      endpoint: env.OPA_SERVER_ENDPOINT,
      name,
      policy: policyCode,
    });

    if (!isSuccess) {
      console.error(`Policy ${name} can not be uploaded`);
      return;
    }
  }

  console.log("Build getting uploaded..");

  // Upload build folder to S3 bucket
  await uploadConfig({
    config,
    fileName: "config.json",
    bucketName: env.S3_BUCKET_NAME,
  });
  console.log("Build uploaded");
};

main();
