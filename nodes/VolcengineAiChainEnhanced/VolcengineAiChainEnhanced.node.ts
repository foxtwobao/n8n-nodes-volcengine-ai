import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';
import { searchEndpoints } from './methods/loadEndpoints';
import { getConnectionHintNoticeField } from './methods/sharedFields';
import { ChatOpenAI, type ClientOptions } from '@langchain/openai';

export class VolcengineAiChainEnhanced implements INodeType {
	methods = {
		listSearch: {
			searchEndpoints,
		},
	};

	description: INodeTypeDescription = {
		displayName: 'VolcengineAi Chat Model (Enhanced)',

		name: 'volcengineAiChainEnhanced',
		icon: { light: 'file:volcengine.logo.svg', dark: 'file:volcengine.logo.svg' },
		group: ['transform'],
		version: [1],
		description: 'Enhanced version with dynamic endpoint loading from Volcengine Ark API',
		defaults: {
			name: 'VolcengineAi Chat Model (Enhanced)',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/',
					},
				],
			},
		},

		inputs: [],

		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'volcengineAiEnhancedApi',
				required: true,
			},
		],
		requestDefaults: {
			ignoreHttpStatusErrors: true,
			baseURL:
				'={{ $parameter.options?.baseURL?.split("/").slice(0,-1).join("/") || $credentials?.url?.split("/").slice(0,-1).join("/") || "https://ark.cn-beijing.volces.com/api/v3" }}',
		},
		properties: [
			getConnectionHintNoticeField([NodeConnectionTypes.AiChain, NodeConnectionTypes.AiAgent]),
			{
				displayName:
					'If using JSON response format, you must include word "json" in the prompt in your chain or agent. Also, make sure to select latest models released post November 2023.',
				name: 'notice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						'/options.responseFormat': ['json_object'],
					},
				},
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select endpoint...',
						typeOptions: {
							searchListMethod: 'searchEndpoints',
							searchable: true,
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						placeholder: 'ep-xxxxxxxxxxxxxxxx',
					},
				],
				description:
					'Select Volcengine Ark Endpoint (only Running status endpoints are shown). You can choose from the list or directly enter the endpoint ID.',
			},
			{
				displayName:
					'When using non-OpenAI models via "Base URL" override, not all models might be chat-compatible or support other features, like tools calling or JSON response format',
				name: 'notice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						'/options.baseURL': [{ _cnd: { exists: true } }],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Base URL',
						name: 'baseURL',
						default: 'https://ark.cn-beijing.volces.com/api/v3',
						description: 'Override the default base URL for the API',
						type: 'string',
					},
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim",
						type: 'number',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						default: 2,
						description: 'Maximum number of retries to attempt',
						type: 'number',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: -1,
						description:
							'The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 32,768).',
						type: 'number',
						typeOptions: {
							maxValue: 32768,
						},
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
						type: 'number',
					},
					{
						displayName: 'Reasoning Effort',
						name: 'reasoningEffort',
						default: 'medium',
						description:
							'Controls the amount of reasoning tokens to use. A value of "low" will favor speed and economical token usage, "high" will favor more complete reasoning at the cost of more tokens generated and slower responses.',
						type: 'options',
						options: [
							{
								name: 'Low',
								value: 'low',
								description: 'Favors speed and economical token usage',
							},
							{
								name: 'Medium',
								value: 'medium',
								description: 'Balance between speed and reasoning accuracy',
							},
							{
								name: 'High',
								value: 'high',
								description:
									'Favors more complete reasoning at the cost of more tokens generated and slower responses',
							},
						],
					},
					{
						displayName: 'Response Format',
						name: 'responseFormat',
						default: 'text',
						type: 'options',
						options: [
							{
								name: 'Text',
								value: 'text',
								description: 'Regular text response',
							},
							{
								name: 'JSON',
								value: 'json_object',
								description:
									'Enables JSON mode, which should guarantee the message the model generates is valid JSON',
							},
						],
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description:
							'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
						type: 'number',
					},
					{
						displayName: 'Thinking Mode',
						name: 'thinkingMode',
						default: 'disabled',
						type: 'options',
						options: [
							{
								name: 'Disabled',
								value: 'disabled',
								description: 'Force disable deep thinking, model will not output reasoning chain',
							},
							{
								name: 'Enabled',
								value: 'enabled',
								description: 'Force enable deep thinking, model will output reasoning chain',
							},
							{
								name: 'Auto',
								value: 'auto',
								description: 'Model decides whether to use deep thinking based on the task',
							},
						],
						description:
							'Control deep thinking/reasoning mode for models that support it (e.g., DeepSeek R1, DeepSeek V3.2)',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						default: 60000,
						description: 'Maximum amount of time a request is allowed to take in milliseconds',
						type: 'number',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						default: 1,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
						description:
							'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
						type: 'number',
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('volcengineAiEnhancedApi');

		// Get endpoint ID from resourceLocator
		const endpointResource = this.getNodeParameter('endpoint', itemIndex) as {
			mode: string;
			value: string;
		};
		const endpointId = endpointResource.value;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			baseURL?: string;
			frequencyPenalty?: number;
			maxTokens?: number;
			maxRetries: number;
			timeout: number;
			presencePenalty?: number;
			temperature?: number;
			topP?: number;
			responseFormat?: 'text' | 'json_object';
			reasoningEffort?: 'low' | 'medium' | 'high';
			thinkingMode?: 'disabled' | 'enabled' | 'auto';
		};

		const authType = (credentials.authType as string) || 'bearer';
		const accessToken = (credentials.accessToken as string) || '';

		const configuration: ClientOptions = {
			baseURL: options.baseURL || 'https://ark.cn-beijing.volces.com/api/v3',
			// When using X-Api-Access-Key, add it as a default header
			// OpenAI SDK still requires a non-empty apiKey, so we pass accessToken below
			// Authorization header will be set by the sdk; Ark accepts Bearer as well
			defaultHeaders: authType === 'x-api-key' ? { 'X-Api-Access-Key': accessToken } : undefined,
		};

		// Build modelKwargs with optional thinking and response_format
		const modelKwargs: Record<string, unknown> = {};

		if (options.responseFormat) {
			modelKwargs.response_format = { type: options.responseFormat };
		}

		// Add thinking mode if specified (disabled/enabled/auto)
		if (options.thinkingMode) {
			modelKwargs.thinking = {
				type: options.thinkingMode,
			};
		}

		const model = new ChatOpenAI({
			apiKey: accessToken,
			model: endpointId,
			...options,
			timeout: options.timeout ?? 60000,
			maxRetries: options.maxRetries ?? 2,
			configuration,
			modelKwargs: Object.keys(modelKwargs).length > 0 ? modelKwargs : undefined,
		});

		return {
			response: model,
		};
	}
}

