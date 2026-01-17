/**
 * AI 平台配置 - Neo-Brutalist 风格图标
 */

const AI_PLATFORMS = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="24" rx="2" fill="#10A37F" stroke="#000" stroke-width="3"/>
      <circle cx="16" cy="16" r="5" fill="none" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="16" r="2" fill="#fff"/>
      <path d="M11 11c0-3 2-5 5-5s5 2 5 5M11 21c0-3 2-5 5-5s5 2 5 5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    url: 'https://chat.openai.com/',
    queryParam: null,
    capabilities: { text: true, image: true, file: true },
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="24" rx="2" fill="#D4A574" stroke="#000" stroke-width="3"/>
      <rect x="8" y="8" width="16" height="16" rx="1" fill="#8B6914" stroke="#000" stroke-width="2"/>
      <circle cx="16" cy="16" r="4" fill="#D4A574"/>
    </svg>`,
    url: 'https://claude.ai/new',
    queryParam: null,
    capabilities: { text: true, image: true, file: true },
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="24" rx="2" fill="#1E88E5" stroke="#000" stroke-width="3"/>
      <circle cx="11" cy="16" r="5" fill="#4FC3F7" stroke="#000" stroke-width="2"/>
      <circle cx="21" cy="16" r="5" fill="#1E88E5" stroke="#000" stroke-width="2"/>
      <circle cx="11" cy="16" r="2" fill="#000"/>
      <circle cx="21" cy="16" r="2" fill="#000"/>
    </svg>`,
    url: 'https://gemini.google.com/app',
    queryParam: null,
    capabilities: { text: true, image: true, file: true },
  },
  google: {
    id: 'google',
    name: 'Google',
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="24" rx="2" fill="#fff" stroke="#000" stroke-width="3"/>
      <circle cx="10" cy="16" r="5" fill="#EA4335"/>
      <circle cx="16" cy="16" r="5" fill="#FBBC05"/>
      <circle cx="22" cy="16" r="5" fill="#4285F4"/>
      <circle cx="16" cy="16" r="2" fill="#fff"/>
    </svg>`,
    url: 'https://www.google.com/search',
    queryParam: 'q',
    capabilities: { text: true, image: false, file: false },
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="24" rx="2" fill="#1E1E1E" stroke="#000" stroke-width="3"/>
      <rect x="6" y="6" width="20" height="20" rx="1" fill="#fff" stroke="#000" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" fill="#000" font-family="monospace" font-size="14" font-weight="bold">P</text>
    </svg>`,
    url: 'https://www.perplexity.ai/',
    queryParam: 'q',
    capabilities: { text: true, image: true, file: false },
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    icon: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="24" rx="2" fill="#000" stroke="#000" stroke-width="3"/>
      <circle cx="16" cy="16" r="6" fill="none" stroke="#fff" stroke-width="3"/>
      <circle cx="16" cy="16" r="2" fill="#fff"/>
      <circle cx="16" cy="7" r="1.5" fill="#fff"/>
      <circle cx="16" cy="25" r="1.5" fill="#fff"/>
      <circle cx="7" cy="16" r="1.5" fill="#fff"/>
      <circle cx="25" cy="16" r="1.5" fill="#fff"/>
    </svg>`,
    url: 'https://grok.com/',
    queryParam: null,
    capabilities: { text: true, image: true, file: false },
  },
};
