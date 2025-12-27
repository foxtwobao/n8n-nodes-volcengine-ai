import type {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class VolcengineAiEnhancedApi implements ICredentialType {
	name = 'volcengineAiEnhancedApi';

	displayName = 'VolcEngine AI Enhanced API';

	documentationUrl = 'https://www.volcengine.com/docs/82379/1099475';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'VolcEngine AI Access Token for model API authentication',
		},
		{
			displayName: 'Auth Type',
			name: 'authType',
			type: 'options',
			default: 'bearer',
			description: 'Select which HTTP header to use for model API authentication',
			options: [
				{ name: 'Authorization: Bearer <token>', value: 'bearer' },
				{ name: 'X-Api-Access-Key: <token>', value: 'x-api-key' },
			],
		},
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			required: true,
			default: '',
			description: 'VolcEngine Access Key ID (AK) for ListEndpoints API',
		},
		{
			displayName: 'Secret Access Key',
			name: 'secretAccessKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'VolcEngine Secret Access Key (SK) for ListEndpoints API',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'string',
			default: 'cn-beijing',
			description: 'VolcEngine region for API calls',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.authType === "bearer" ? ("Bearer " + $credentials.accessToken) : undefined}}',
				'X-Api-Access-Key': '={{$credentials.authType === "x-api-key" ? $credentials.accessToken : undefined}}',
			},
		},
	};
}

