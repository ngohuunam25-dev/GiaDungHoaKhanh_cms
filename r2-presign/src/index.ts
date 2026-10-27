import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export interface Env {
	R2_ACCOUNT_ID: string;
	R2_BUCKET: string;
	PUBLIC_URL: string;
	ALLOWED_ORIGINS: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
	UPLOAD_SECRET: string;
}
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const origin = request.headers.get('Origin') ?? '';
		const allowed = env.ALLOWED_ORIGINS.split(',');
		console.log('origin', origin);
		console.log('request', request);

		const cors = {
			'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Secret',
		};

		if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
		if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

		if (!allowed.includes(origin) || request.headers.get('X-Upload-Secret') !== env.UPLOAD_SECRET) {
			return new Response('Unauthorized', { status: 401, headers: cors });
		}

		const { filename, contentType } = (await request.json()) as {
			filename: string;
			contentType: string;
		};
		const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
		const key = `uploads/${Date.now()}-${safeName}`;

		const s3 = new S3Client({
			region: 'auto',
			endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			},
		});

		const uploadUrl = await getSignedUrl(
			s3,
			new PutObjectCommand({
				Bucket: env.R2_BUCKET,
				Key: key,
				ContentType: contentType,
			}),
			{ expiresIn: 3000 },
		);
		return Response.json({ uploadUrl, publicUrl: `${env.PUBLIC_URL}/${key}`, key }, { headers: cors });
	},
} satisfies ExportedHandler<Env>;
