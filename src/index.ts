import { getInput, setFailed, info, error as logError } from '@actions/core';
import { get as getHttps } from 'https';
import { get as getHttp } from 'http';
import { IncomingMessage } from 'http';

enum Protocol {
	http = 'http:',
	https = 'https:',
}

const url = new URL(getInput('url'));
const maxAttempts = parseInt(getInput('max-attempts') || '5', 10);
const retryDelay = parseInt(getInput('retry-delay') || '10000', 10);
const expectStatus = parseInt(getInput('expect-status') || '200', 10);

info(`Health check version v2.0.5`);
info(`🔍 Checking site status: ${url.href}`);
info(`🔄 Max attempts: ${maxAttempts}, Retry delay: ${retryDelay}ms, Expected status: ${expectStatus}`);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkSite(): Promise<void> {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		info(`🚀 Attempt ${attempt} of ${maxAttempts}`);

		try {
			const statusCode = await new Promise<number>((resolve, reject) => {
				const handleResponse = (res: IncomingMessage) => resolve(res.statusCode ?? 0);
				const handleError = (err: Error) => reject(err);

				if (url.protocol === Protocol.http) {
					info(`🌍 Using HTTP protocol to check site.`);
					const req = getHttp(url, handleResponse);
					req.on('error', handleError);
				} else if (url.protocol === Protocol.https) {
					info(`🔒 Using HTTPS protocol to check site.`);
					const req = getHttps(url, handleResponse);
					req.on('error', handleError);
				} else {
					reject(new Error(`Unsupported protocol: ${url.protocol}`));
				}
			});

			if (statusCode === expectStatus) {
				info(`✅ Site is up! HTTP status: ${statusCode}`);
				return;
			} else {
				logError(`❌ Site responded with HTTP code: ${statusCode}`);
				if (attempt < maxAttempts) {
					info(`🔁 Retrying in ${retryDelay}ms...`);
					await delay(retryDelay);
				} else {
					setFailed(`❌ Site is down! Expected HTTP status: ${expectStatus}, but received: ${statusCode}`);
				}
			}
		} catch (err: any) {
			logError(`🚨 Request failed: ${err.message}`);
			if (attempt < maxAttempts) {
				info(`🔁 Retrying in ${retryDelay}ms...`);
				await delay(retryDelay);
			} else {
				setFailed(`❌ Failed to connect to site after ${maxAttempts} attempts.`);
			}
		}
	}
}

(async () => {
	try {
		await checkSite();
	} catch (error: any) {
		logError(`Unhandled error: ${error.message}`);
		setFailed(error.message);
	}
})();