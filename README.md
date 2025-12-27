# n8n-nodes-volcengine-ai-enhanced

[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![中文文档](https://img.shields.io/badge/中文文档-点击查看-orange)](README-zh.md)

This is an enhanced n8n community node for VolcEngine Ark (火山方舟) AI services, forked and improved from [crazyyanchao/n8n-nodes-volcengine-ai](https://github.com/crazyyanchao/n8n-nodes-volcengine-ai).

## 🙏 Acknowledgments

This project is based on the excellent work by [@crazyyanchao](https://github.com/crazyyanchao). We extend our sincere thanks for the original implementation.

**Original Repository**: [crazyyanchao/n8n-nodes-volcengine-ai](https://github.com/crazyyanchao/n8n-nodes-volcengine-ai)

## ✨ Key Enhancements

This enhanced version introduces the following major improvements:

### 🚀 Dynamic Endpoint Loading
- **Automatic Endpoint Discovery**: Dynamically loads available endpoints from VolcEngine Ark API instead of hardcoded model lists
- **Real-time Updates**: Always shows the latest available endpoints with "Running" status
- **Smart Filtering**: Automatically filters and displays only active endpoints

### 🧠 Thinking Mode Support
- **Deep Thinking Mode**: Full support for DeepSeek R1, DeepSeek V3.2, and other models with thinking capabilities
- **Three Modes Available**:
  - `disabled`: Force disable deep thinking
  - `enabled`: Force enable deep thinking with reasoning chain output
  - `auto`: Model automatically decides when to use deep thinking
- **Official API Compliance**: Implements according to [VolcEngine Ark documentation](https://www.volcengine.com/docs/82379/1449737)

### 🔐 Enhanced Authentication
- **Dual Authentication Support**: 
  - API Token for model API calls (Bearer or X-Api-Access-Key)
  - AK/SK (Access Key/Secret Key) for ListEndpoints API with HMAC-SHA256 signature
- **VolcEngine V4 Signature**: Proper implementation of VolcEngine API signature algorithm

### 🎯 Focused on Chat Model
- **Chat Model Node Only**: This project focuses exclusively on the chat model node for n8n's AI workflows
- **n8n Integration**: Designed specifically for use with:
  - **AI Chain**: Connect to AI Chain nodes to build complex reasoning workflows
  - **AI Agent**: Connect to AI Agent nodes for autonomous task execution with reasoning capabilities
  - **LangChain Compatibility**: Fully compatible with n8n's LangChain integration

## 📋 Features

This node provides:

- **Dynamic Endpoint Selection**: Choose from live endpoints loaded from VolcEngine Ark
- **Chat Completion**: Intelligent conversation capabilities with multi-turn support
- **Thinking Mode**: Enable deep reasoning for complex tasks
- **Rich Parameter Configuration**: Temperature, max tokens, penalties, response format, etc.
- **LangChain Integration**: Compatible with n8n's AI chain and agent workflows

## 🚀 Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Using npm

```bash
npm install n8n-nodes-volcengine-ai-enhanced
```

### Manual Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run build`
4. Copy the `dist` folder to your n8n custom nodes directory

## 🔑 Credentials Setup

To use this node, you need to configure the **VolcEngine AI Enhanced API** credentials:

### Required Fields

1. **Access Token**: Your VolcEngine AI API token (for model API calls)
   - Used for chat completion requests
   - Supports both Bearer and X-Api-Access-Key authentication

2. **Access Key ID (AK)**: Your VolcEngine Access Key ID
   - Required for ListEndpoints API calls
   - Used for HMAC-SHA256 signature authentication

3. **Secret Access Key (SK)**: Your VolcEngine Secret Access Key
   - Required for ListEndpoints API calls
   - Used for HMAC-SHA256 signature authentication

4. **Region**: VolcEngine region (default: `cn-beijing`)
   - Used for API endpoint selection

### How to Get Credentials

1. **Register VolcEngine Account**: Visit [VolcEngine Official Website](https://www.volcengine.com/) to register
2. **Enable Ark Service**: Enable VolcEngine Ark service in the console
3. **Create API Token**: Create an API token in the VolcEngine console for model API calls
4. **Create Access Key**: Create an Access Key (AK/SK) in the VolcEngine console for ListEndpoints API

## 📖 Usage Instructions

### Basic Workflow

1. **Install the Node**: Install this community node in your n8n instance
2. **Configure Credentials**: 
   - Add "VolcEngine AI Enhanced API" credentials
   - Fill in Access Token, Access Key ID, Secret Access Key, and Region
3. **Add Node to Workflow**: 
   - Add "VolcengineAi Chat Model (Enhanced)" node to your workflow
   - Connect it to AI Chain or AI Agent nodes
4. **Select Endpoint**: 
   - Choose an endpoint from the dropdown (dynamically loaded)
   - Or manually enter an endpoint ID
5. **Configure Options** (optional):
   - Enable Thinking Mode if your model supports it
   - Adjust temperature, max tokens, etc.
6. **Execute Workflow**: Run the workflow to get AI responses

### Thinking Mode Configuration

For models that support deep thinking (e.g., DeepSeek R1, DeepSeek V3.2):

1. Select your endpoint
2. In **Options**, set **Thinking Mode** to:
   - `disabled`: No thinking chain output
   - `enabled`: Always output thinking chain
   - `auto`: Let the model decide

### Example: Using with AI Chain

```
[AI Chain] → [VolcengineAi Chat Model (Enhanced)] → [Output]
```

The enhanced node provides the language model to the AI Chain, which can then process complex workflows with reasoning capabilities.

## ⚙️ Available Options

- **Base URL**: Override default API endpoint
- **Frequency Penalty**: Reduce repetitive content (-2 to 2)
- **Max Retries**: Maximum retry attempts
- **Maximum Number of Tokens**: Max output length (up to 32768)
- **Presence Penalty**: Encourage new topics (-2 to 2)
- **Reasoning Effort**: Control reasoning token usage (low/medium/high)
- **Response Format**: Text or JSON output
- **Sampling Temperature**: Control randomness (0-2)
- **Thinking Mode**: Enable/disable/auto deep thinking
- **Timeout**: Request timeout in milliseconds
- **Top P**: Nucleus sampling diversity (0-1)

## 🔧 Compatibility

- **Minimum n8n Version**: 1.0.0
- **Node.js Version**: >=22.16
- **Tested Version**: n8n 1.0.0+

## 📚 Resources

* [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
* [VolcEngine Ark Documentation](https://www.volcengine.com/docs/82379/1099475)
* [VolcEngine Ark API Reference](https://www.volcengine.com/docs/82379/1099475)
* [VolcEngine Ark Deep Thinking Guide](https://www.volcengine.com/docs/82379/1449737)
* [VolcEngine Official Website](https://www.volcengine.com/)

## 📝 License

MIT License - Same as the original project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Notes

- This node requires a valid VolcEngine account with Ark service enabled
- Please ensure compliance with VolcEngine's terms of use and API call limits
- The ListEndpoints API requires AK/SK authentication
- Thinking mode is only available for models that support it (e.g., DeepSeek R1, DeepSeek V3.2)

---

**Forked from**: [crazyyanchao/n8n-nodes-volcengine-ai](https://github.com/crazyyanchao/n8n-nodes-volcengine-ai)  
**Maintained by**: [@foxtwobao](https://github.com/foxtwobao)
