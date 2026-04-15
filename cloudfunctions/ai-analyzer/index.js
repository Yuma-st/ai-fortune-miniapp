// 云函数入口：AI 分析器
const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// AI 配置 - 请替换为你自己的 API Key
const AI_CONFIG = {
  // 使用智谱 AI（推荐国内用户）
  provider: 'zhipu',
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '', // TODO: 在微信云开发环境变量中设置
    model: 'glm-4',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  },
  // 备用：OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o',
    apiUrl: 'https://api.openai.com/v1/chat/completions'
  }
};

// 提示词模板
const PROMPTS = {
  bazi: {
    system: `你是一位资深八字命理分析师，擅长根据出生时间分析性格、事业和爱情。你用温柔、浪漫、富有诗意的语言风格输出分析结果，帮助用户更好地了解自己和对未来的期待。你绝不会给出负面的命定性描述，所有结果都会给予用户积极正向的引导。输出必须是有效的 JSON 格式。`,
    user: `请分析以下八字命理：

出生日期：{{birthDate}}
性别：{{gender}}

请生成以下 JSON 格式的分析结果（严格按照格式，不要添加任何额外文字说明）：
{
  "title": "你的命定之人",
  "personality": {
    "tags": ["标签1", "标签2", "标签3"],
    "description": "性格描述文字，150字以内"
  },
  "loveStyle": {
    "strength": "爱情优势描述，50字以内",
    "weakness": "需要注意的盲点，50字以内"
  },
  "idealPartner": {
    "appearance": "理想伴侣的外貌特征描述，50字以内",
    "personality": "理想伴侣的性格描述，50字以内",
    "scenario": "你们相遇的场景描述，50字以内"
  },
  "timing": {
    "when": "正缘出现的大致时间或时机描述，50字以内",
    "signs": ["信号1", "信号2", "信号3"]
  },
  "advice": ["建议1", "建议2", "建议3"],
  "tags": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
}`
  },
  xingpan: {
    system: `你是一位资深西方占星师，擅长星盘解读。你的语言风格温柔浪漫，富有诗意，能将复杂的星象知识转化为温暖人心的解读。你会给用户积极正向的引导，帮助他们更好地理解自己和生活。输出必须是有效的 JSON 格式。`,
    user: `请分析以下星盘信息：

出生日期：{{birthDate}}
性别：{{gender}}

请生成以下 JSON 格式的分析结果（严格按照格式，不要添加任何额外文字说明）：
{
  "title": "星盘里的爱情密码",
  "personality": {
    "tags": ["太阳星座特质1", "月亮星座特质2", "上升星座特质3"],
    "description": "综合星盘性格描述，150字以内"
  },
  "loveStyle": {
    "strength": "在感情中的优势，50字以内",
    "weakness": "需要注意的盲点，50字以内"
  },
  "idealPartner": {
    "appearance": "理想伴侣的外貌特征，50字以内",
    "personality": "理想伴侣的性格，50字以内",
    "scenario": "你们相遇的场景，50字以内"
  },
  "timing": {
    "when": "正缘出现的时机描述，50字以内",
    "signs": ["星象信号1", "星象信号2", "星象信号3"]
  },
  "advice": ["建议1", "建议2", "建议3"],
  "tags": ["星座关键词1", "星座关键词2", "星座关键词3", "星座关键词4", "星座关键词5"]
}`
  },
  tuoluo: {
    system: `你是一位资深塔罗占卜师，你用神秘而温暖的语言解读塔罗牌阵。你相信每个人的命运都掌握在自己手中，塔罗只是提供指引，而非定论。你的解读充满智慧和慈悲，帮助用户找到内心的力量。输出必须是有效的 JSON 格式。`,
    user: `请解读以下塔罗牌阵（爱情主题）：

出生日期：{{birthDate}}
性别：{{gender}}

请生成以下 JSON 格式的塔罗解读（严格按照格式，不要添加任何额外文字说明）：
{
  "title": "塔罗的爱情指引",
  "personality": {
    "tags": ["你性格中的光", "你性格中的影", "你的隐藏力量"],
    "description": "塔罗视角下的你，150字以内"
  },
  "loveStyle": {
    "strength": "你在爱情中的闪光点，50字以内",
    "weakness": "需要注意的地方，50字以内"
  },
  "idealPartner": {
    "appearance": "正缘的外貌特征描述，50字以内",
    "personality": "正缘的性格特征，50字以内",
    "scenario": "你们相遇的场景，50字以内"
  },
  "timing": {
    "when": "指引显示的时机，50字以内",
    "signs": ["牌面显示的信号1", "信号2", "信号3"]
  },
  "advice": ["指引1", "指引2", "指引3"],
  "tags": ["塔罗关键词1", "塔罗关键词2", "塔罗关键词3", "塔罗关键词4", "塔罗关键词5"]
}`
  }
};

// 调用智谱 AI
async function callZhipuAI(systemPrompt, userPrompt) {
  const config = AI_CONFIG.zhipu;
  
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`智谱 API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 调用 OpenAI API
async function callOpenAI(systemPrompt, userPrompt) {
  const config = AI_CONFIG.openai;
  
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 解析 AI 返回的 JSON
function parseAIResponse(content) {
  // 尝试提取 JSON
  let jsonStr = content;
  
  // 尝试找到 JSON 块
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                   content.match(/```\n?([\s\S]*?)\n?```/) ||
                   content.match(/(\{[\s\S]*\})/);
  
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('JSON 解析失败:', err);
    console.error('原始内容:', content);
    throw new Error('AI 返回格式解析失败');
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  try {
    const { type, birthDate, birthHour, gender } = event;

    // 验证参数
    if (!type || !birthDate || !gender) {
      return {
        success: false,
        error: '缺少必要参数'
      };
    }

    // 获取提示词
    const promptTemplate = PROMPTS[type];
    if (!promptTemplate) {
      return {
        success: false,
        error: '不支持的玄学类型'
      };
    }

    // 替换用户信息
    const userPrompt = promptTemplate.user
      .replace('{{birthDate}}', birthDate)
      .replace('{{gender}}', gender === 'female' ? '女性' : '男性');

    // 调用 AI
    let aiResponse;
    if (AI_CONFIG.provider === 'zhipu' && AI_CONFIG.zhipu.apiKey) {
      aiResponse = await callZhipuAI(promptTemplate.system, userPrompt);
    } else if (AI_CONFIG.provider === 'openai' && AI_CONFIG.openai.apiKey) {
      aiResponse = await callOpenAI(promptTemplate.system, userPrompt);
    } else {
      // 如果没有配置 API，返回模拟数据（开发测试用）
      console.log('未配置 AI API，返回模拟数据');
      return getMockResult(type);
    }

    // 解析结果
    const result = parseAIResponse(aiResponse);

    // 保存记录到数据库
    try {
      const db = cloud.database();
      await db.collection('records').add({
        data: {
          openid: wxContext.OPENID,
          type: type,
          birthDate: birthDate,
          gender: gender,
          result: result,
          createdAt: Date.now()
        }
      });
    } catch (dbErr) {
      console.error('数据库写入失败:', dbErr);
      // 不影响主流程，只是记录失败
    }

    return {
      success: true,
      result: result
    };

  } catch (err) {
    console.error('AI 分析失败:', err);
    return {
      success: false,
      error: err.message || '分析失败，请稍后重试'
    };
  }
};

// 模拟数据（开发测试用）
function getMockResult(type) {
  const mockData = {
    bazi: {
      title: '你的命定之人',
      personality: {
        tags: ['温柔细腻', '内心坚韧', '浪漫主义者'],
        description: '你是一个外表温柔但内心很有力量的人。你对生活充满热情，喜欢追求美好的事物，同时也很懂得照顾他人的感受。在感情中，你倾向于付出真心，但也需要被理解和珍惜。'
      },
      loveStyle: {
        strength: '你懂得如何表达爱意，能给对方满满的幸福感',
        weakness: '有时候过于在意对方，可能会忽略自己的感受'
      },
      idealPartner: {
        appearance: '眼神温柔、笑容温暖的人',
        personality: '体贴入微、有责任心、懂得倾听',
        scenario: '可能在一个阳光明媚的午后，你们在一家安静的咖啡馆相遇'
      },
      timing: {
        when: '在你学会爱自己之后，正缘就会悄然出现',
        signs: ['内心变得更加平和', '不再急于寻找', '开始享受独处']
      },
      advice: [
        '学会先爱自己，才能更好地爱别人',
        '不要害怕表达真实的感受',
        '相信直觉，它会指引你找到对的人'
      ],
      tags: ['温柔', '真诚', '浪漫', '细腻', '专一']
    },
    xingpan: {
      title: '星盘里的爱情密码',
      personality: {
        tags: ['神秘感', '理想主义', '情感丰富'],
        description: '你的星盘散发着独特的魅力，你对爱情有着美好的憧憬和向往。你是个浪漫主义者，渴望找到灵魂深处的共鸣。在外人眼中你可能有些神秘，但只有真正了解你的人才能感受到你内心的温暖。'
      },
      loveStyle: {
        strength: '你能敏锐地感知伴侣的情绪，给予恰到好处的关怀',
        weakness: '有时候会过度理想化，期待过于完美'
      },
      idealPartner: {
        appearance: '气质出众、眼神深邃的人',
        personality: '有深度、有智慧、能够欣赏你的独特',
        scenario: '在一次星空下的散步中，你们的目光相遇了'
      },
      timing: {
        when: '当你的内在成长到足够强大的那一天',
        signs: ['开始接纳自己的不完美', '内心充满感恩', '对生活充满热情']
      },
      advice: [
        '放下对完美的执念，接纳真实的自己',
        '用心去感受，而不是用头脑去分析',
        '耐心等待，属于你的星星一直在那里'
      ],
      tags: ['神秘', '浪漫', '理想主义', '敏感', '独特']
    },
    tuoluo: {
      title: '塔罗的爱情指引',
      personality: {
        tags: ['直觉敏锐', '内心强大', '善于等待'],
        description: '塔罗牌显示你是一个有着强大直觉的人。你不会被表面的现象所迷惑，而是能够透过表象看到本质。你懂得静待时机，相信命运的安排自有其道理。这样的你，在爱情中也会找到属于你的答案。'
      },
      loveStyle: {
        strength: '你不会被冲动左右，而是深思熟虑后做出选择',
        weakness: '有时候想得太多，反而错过了表达的机会'
      },
      idealPartner: {
        appearance: '稳重踏实、眼神真诚的人',
        personality: '诚实可靠、有耐心、愿意陪你一起成长',
        scenario: '在一段迷茫之后，你突然发现，他一直在你身边'
      },
      timing: {
        when: '当你放下焦虑、回归内心的平静时',
        signs: ['不再急于得到答案', '开始享受当下的每一刻', '内心充满确信']
      },
      advice: [
        '相信自己的直觉，它是你最可靠的向导',
        '不要急于求成，属于你的终会到来',
        '每一个经历都是在帮助你成长'
      ],
      tags: ['直觉', '智慧', '平静', '成长', '相信']
    }
  };

  return {
    success: true,
    result: mockData[type] || mockData.bazi
  };
}
