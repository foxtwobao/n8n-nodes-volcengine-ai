import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { signRequest, buildUrl } from '../utils/volcengineSigner';

interface EndpointItem {
	Id: string;
	Name: string;
	Status: string;
	EndpointType: string;
	// 模型信息可能在不同字段
	Model?: {
		Name?: string;
		Id?: string;
	};
	// 有些 endpoint 使用 ModelReference
	ModelReference?: {
		FoundationModel?: {
			Name?: string;
		};
	};
}

interface ListEndpointsResponse {
	ResponseMetadata: {
		RequestId: string;
		Action: string;
		Version: string;
		Service: string;
		Region: string;
		Error?: {
			Code: string;
			Message: string;
		};
	};
	Result?: {
		Items: EndpointItem[];
		Total: number;
	};
}

export async function searchEndpoints(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('volcengineAiEnhancedApi');

	const accessKeyId = credentials.accessKeyId as string;
	const secretAccessKey = credentials.secretAccessKey as string;
	const region = (credentials.region as string) || 'cn-beijing';

	// If AK/SK not configured, return empty list with hint
	if (!accessKeyId || !secretAccessKey) {
		return {
			results: [
				{
					name: '请配置 Access Key ID 和 Secret Access Key 以获取 Endpoint 列表',
					value: '',
				},
			],
		};
	}

	const host = 'open.volcengineapi.com';
	const path = '/';
	const query: Record<string, string> = {
		Action: 'ListEndpoints',
		Version: '2024-01-01',
		PageSize: '100',
	};

	try {
		const signedHeaders = signRequest(
			{ accessKeyId, secretAccessKey, region },
			{
				method: 'GET',
				host,
				path,
				query,
				service: 'ark',
			},
		);

		const url = buildUrl(host, path, query);

		const response = await this.helpers.request({
			method: 'GET',
			url,
			headers: signedHeaders,
			json: true,
		});

		const data = response as ListEndpointsResponse;

		// Check for API error
		if (data.ResponseMetadata?.Error) {
			const error = data.ResponseMetadata.Error;
			return {
				results: [
					{
						name: `API Error: ${error.Code} - ${error.Message}`,
						value: '',
					},
				],
			};
		}

		// Filter only Running endpoints
		const endpoints = (data.Result?.Items || []).filter(
			(item) => item.Status === 'Running',
		);

		// Apply search filter if provided
		const filteredEndpoints = endpoints.filter((endpoint) => {
			if (!filter) return true;
			const lowerFilter = filter.toLowerCase();
			return (
				endpoint.Id.toLowerCase().includes(lowerFilter) ||
				endpoint.Name.toLowerCase().includes(lowerFilter) ||
				(endpoint.Model?.Name?.toLowerCase().includes(lowerFilter) ?? false)
			);
		});

		// Sort by name
		filteredEndpoints.sort((a, b) => a.Name.localeCompare(b.Name));

		// Format results - 显示为 "Endpoint名称 (Endpoint ID)"
		const results = filteredEndpoints.map((endpoint) => {
			return {
				name: `${endpoint.Name} (${endpoint.Id})`,
				value: endpoint.Id,
			};
		});

		if (results.length === 0) {
			return {
				results: [
					{
						name: filter
							? '没有找到匹配的 Running 状态 Endpoint'
							: '没有 Running 状态的 Endpoint',
						value: '',
					},
				],
			};
		}

		return { results };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			results: [
				{
					name: `获取 Endpoint 列表失败: ${errorMessage}`,
					value: '',
				},
			],
		};
	}
}

