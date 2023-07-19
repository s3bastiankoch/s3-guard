require("dotenv").config();
const aws4 = require("aws4");
const { URL } = require("url");

module.exports = {
  signRequest,
  logResponse,
};

async function signRequest(requestParams, context, ee, next) {
  const url = new URL(requestParams.url);

  const signed = aws4.sign(
    {
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      host: url.host,
      service: "s3",
      path: url.pathname,
    },
    {
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    }
  );

  requestParams.headers = signed.headers;

  return next(); // MUST be called for the scenario to continue
}

function logResponse(requestParams, response, context, ee, next) {
  // console.log(response);
  return next(); // MUST be called for the scenario to continue
}
