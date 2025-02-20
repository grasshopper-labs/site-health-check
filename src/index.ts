import { getInput, setFailed, info, warning, error as logError } from '@actions/core';
import { get as getHttps } from 'https';
import { get as getHttp, IncomingMessage } from 'http';

enum Protocol {
	http = 'http:',
	https = 'https:',
}

try {
	const url = new URL(getInput('url'));
	info(`🔍 Checking site status: ${url.href}`);

	const handleResponse = ({ statusCode }: IncomingMessage) => {
		if (statusCode !== 200) {
			logError(`❌ Site responded with HTTP code: ${statusCode}`);
			setFailed(`Site is down! Received HTTP status: ${statusCode}`);
		} else {
			info(`✅ Site is up! HTTP status: ${statusCode}`);
		}
	};

	switch (url.protocol) {
		case Protocol.http:
			info(`🌍 Using HTTP protocol to check site.`);
			getHttp(url, handleResponse);
			break;
		case Protocol.https:
			info(`🔒 Using HTTPS protocol to check site.`);
			getHttps(url, handleResponse);
			break;
		default:
			logError(`⚠️ Protocol ${url.protocol} is not implemented yet!`);
			throw new Error(`Protocol ${url.protocol} is not implemented yet!`);
	}
} catch (error) {
	if (error instanceof Error) {
		logError(`🚨 Error: ${error.message}`);
		setFailed(error.message);
	}

	setFailed('❗ There was a problem with processing your request.');
}
