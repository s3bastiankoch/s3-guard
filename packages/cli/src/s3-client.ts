import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3 = new S3Client({ 
	endpoint: env.S3_URL,
	credentials: { 
		accessKeyId: env.S3_ACCESS_KEY_ID, 
		secretAccessKey: env.S3_SECRET_ACCESS_KEY
	},
	forcePathStyle: env.S3_FORCE_PATH_SYTLE,
});