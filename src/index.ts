import { getInput, setFailed, info, error as logError } from '@actions/core';
import { get as getHttps } from 'https';
import { get as getHttp, IncomingMessage } from 'http';

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

const checkSite = async (attempt: number = 1): Promise<void> => {
	info(`🚀 Attempt ${attempt} of ${maxAttempts}`);

	try {
		const statusCode = await new Promise<number>((resolve, reject) => {
			const handleResponse = (res: IncomingMessage) => resolve(res.statusCode || 0);
			const handleError = (err: Error) => reject(err);

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
					return reject(new Error(`Protocol ${url.protocol} is not implemented yet!`));
			}
		});

		if (statusCode !== expectStatus) {
			logError(`❌ Site responded with HTTP code: ${statusCode}`);
			if (attempt < maxAttempts) {
				info(`🔁 Retrying in ${retryDelay}ms...`);
				await delay(retryDelay);
				await checkSite(attempt + 1);
			} else {
				setFailed(`Site is down! Expected HTTP status: ${expectStatus}, but received: ${statusCode}`);
			}
		} else {
			info(`✅ Site is up! HTTP status: ${statusCode}`);
		}
	} catch (err) {
		logError(`🚨 Error: ${(err as Error).message}`);
		if (attempt < maxAttempts) {
			info(`🔁 Retrying in ${retryDelay}ms...`);
			await delay(retryDelay);
			await checkSite(attempt + 1);
		} else {
			setFailed(`Failed to connect to site after ${maxAttempts} attempts.`);
		}
	}
};

checkSite().catch(error => {
	logError(`🚨 Error: ${error.message}`);
	setFailed(error.message);
});
