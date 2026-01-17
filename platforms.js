/**
 * AI 平台配置
 */
const AI_PLATFORMS = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    url: 'https://chat.openai.com/',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: true,
    },
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    url: 'https://claude.ai/new',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: true,
    },
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    url: 'https://gemini.google.com/app',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: true,
    },
  },
  google: {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    url: 'https://www.google.com/search',
    queryParam: 'q',
    capabilities: {
      text: true,
      image: false,
      file: false,
    },
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🔮',
    url: 'https://www.perplexity.ai/',
    queryParam: 'q',
    capabilities: {
      text: true,
      image: true,
      file: false,
    },
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    icon: '⚡',
    url: 'https://grok.com/',
    queryParam: null,
    capabilities: {
      text: true,
      image: true,
      file: false,
    },
  },
};
