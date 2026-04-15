module.exports = {
  // AI 服务商配置
  // 推荐使用智谱 AI（国内访问稳定）：https://open.bigmodel.cn
  
  AI_PROVIDER: process.env.AI_PROVIDER || 'zhipu', // 'zhipu' | 'openai'
  
  // 智谱 AI 配置（推荐）
  ZHIPU: {
    API_KEY: process.env.ZHIPU_API_KEY || '', // 在微信云开发环境变量中设置
    MODEL: 'glm-4',
    API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  },
  
  // OpenAI 配置（备选，需要翻墙）
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || '',
    MODEL: 'gpt-4o',
    API_URL: 'https://api.openai.com/v1/chat/completions'
  },
  
  // 其他配置
  TEMPERATURE: 0.8,
  MAX_TOKENS: 1500,
  
  // 每日免费次数
  DAILY_FREE_USES: 3,
  
  // 广告奖励次数
  AD_REWARD_USES: 1
};
