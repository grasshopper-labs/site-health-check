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
const followRedirect = getInput('follow-redirect') === 'true';
const expectStatus = parseInt(getInput('expect-status') || '200', 10);

info(`🔍 Checking site status: ${url.href}`);
info(`🔄 Max attempts: ${maxAttempts}, Retry delay: ${retryDelay}ms, Follow redirect: ${followRedirect}, Expected status: ${expectStatus}`);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkSite = async (): Promise<void> => {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		info(`🚀 Attempt ${attempt} of ${maxAttempts}`);

		const statusCode = await new Promise<number>((resolve, reject) => {
			const handleResponse = (res: IncomingMessage) => {
				resolve(res.statusCode || 0);
			};
			const handleError = (err: Error) => {
				reject(err);
			};

			switch (url.protocol) {
				case Protocol.http:
					info(`🌍 Using HTTP protocol to check site.`);
					const httpReq = getHttp(url, handleResponse);
					httpReq.on('error', handleError);
					break;
				case Protocol.https:
					info(`🔒 Using HTTPS protocol to check site.`);
					const httpsReq = getHttps(url, handleResponse);
					httpsReq.on('error', handleError);
					break;
				default:
					reject(new Error(`⚠️ Protocol ${url.protocol} is not implemented.`));
			}
		}).catch((err: Error) => {
			logError(`🚨 Error: ${err.message}`);
			return 0; // return 0 as fake status to retry
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
				setFailed(`Site is down! Expected HTTP status: ${expectStatus}, but received: ${statusCode}`);
			}
		}
	}
};

checkSite().catch(error => {
	logError(`🚨 Unexpected error: ${error.message}`);
	setFailed(error.message);
});