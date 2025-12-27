import * as crypto from 'crypto';

export interface VolcengineCredentials {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
}

export interface SignedRequestOptions {
	method: string;
	host: string;
	path: string;
	query: Record<string, string>;
	headers?: Record<string, string>;
	body?: string;
	service: string;
}

/**
 * HMAC-SHA256 helper function
 */
function hmacSha256(key: Buffer | string, data: string): Buffer {
	return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

/**
 * SHA256 hash helper function
 */
function sha256Hash(data: string): string {
	return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Format date as YYYYMMDD
 */
function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Format datetime as YYYYMMDDTHHMMSSZ
 */
function formatDateTime(date: Date): string {
	return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Encode URI component according to RFC 3986
 */
function uriEncode(str: string, encodeSlash: boolean = true): string {
	let encoded = encodeURIComponent(str);
	// Additional encoding for special characters
	encoded = encoded.replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
	if (!encodeSlash) {
		encoded = encoded.replace(/%2F/g, '/');
	}
	return encoded;
}

/**
 * Create canonical query string from query parameters
 */
function createCanonicalQueryString(query: Record<string, string>): string {
	const sortedKeys = Object.keys(query).sort();
	const parts: string[] = [];
	for (const key of sortedKeys) {
		parts.push(`${uriEncode(key)}=${uriEncode(query[key])}`);
	}
	return parts.join('&');
}

/**
 * Create canonical headers string
 */
function createCanonicalHeaders(headers: Record<string, string>): string {
	const sortedKeys = Object.keys(headers)
		.map((k) => k.toLowerCase())
		.sort();
	const parts: string[] = [];
	for (const key of sortedKeys) {
		const originalKey = Object.keys(headers).find((k) => k.toLowerCase() === key);
		if (originalKey) {
			parts.push(`${key}:${headers[originalKey].trim()}`);
		}
	}
	return parts.join('\n') + '\n';
}

/**
 * Create signed headers string
 */
function createSignedHeaders(headers: Record<string, string>): string {
	return Object.keys(headers)
		.map((k) => k.toLowerCase())
		.sort()
		.join(';');
}

/**
 * Sign request using Volcengine V4 signature algorithm
 */
export function signRequest(
	credentials: VolcengineCredentials,
	options: SignedRequestOptions,
): Record<string, string> {
	const now = new Date();
	const dateStamp = formatDate(now);
	const amzDate = formatDateTime(now);

	// Prepare headers
	const headers: Record<string, string> = {
		Host: options.host,
		'X-Date': amzDate,
		'X-Content-Sha256': sha256Hash(options.body || ''),
		...(options.headers || {}),
	};

	// Create canonical request
	const canonicalUri = options.path || '/';
	const canonicalQueryString = createCanonicalQueryString(options.query);
	const canonicalHeaders = createCanonicalHeaders(headers);
	const signedHeaders = createSignedHeaders(headers);
	const payloadHash = sha256Hash(options.body || '');

	const canonicalRequest = [
		options.method,
		canonicalUri,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join('\n');

	// Create string to sign
	const algorithm = 'HMAC-SHA256';
	const credentialScope = `${dateStamp}/${credentials.region}/${options.service}/request`;
	const stringToSign = [
		algorithm,
		amzDate,
		credentialScope,
		sha256Hash(canonicalRequest),
	].join('\n');

	// Calculate signature
	const kDate = hmacSha256(credentials.secretAccessKey, dateStamp);
	const kRegion = hmacSha256(kDate, credentials.region);
	const kService = hmacSha256(kRegion, options.service);
	const kSigning = hmacSha256(kService, 'request');
	const signature = hmacSha256(kSigning, stringToSign).toString('hex');

	// Create authorization header
	const authorization = `${algorithm} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

	return {
		...headers,
		Authorization: authorization,
	};
}

/**
 * Build full URL with query parameters
 */
export function buildUrl(host: string, path: string, query: Record<string, string>): string {
	const queryString = Object.entries(query)
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');
	return `https://${host}${path}?${queryString}`;
}

