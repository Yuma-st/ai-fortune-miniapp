# AI 命理 - 微信小程序

> AI + 玄学 + 灵魂伴侣解读小程序

✨ 基于 AI 的玄学分析工具，支持八字命理、星盘解读、塔罗占卜三种测算方式，通过精美的卡牌展示分析结果。

## 功能特点

- 🔮 **八字命理** - 东方传统智慧，分析性格与爱情
- ⭐ **星盘解读** - 西方星座奥秘，探索星盘密码
- 🔮 **塔罗占卜** - 神秘塔罗指引，指引爱情方向
- 📤 **社交分享** - 一键分享到微信群/朋友圈
- 📺 **激励视频** - 观看广告获取更多分析机会

## 技术栈

| 模块 | 技术 |
|------|------|
| 小程序框架 | 原生微信小程序 |
| 云开发 | 微信云开发 |
| AI 分析 | 智谱 GLM-4 / OpenAI GPT-4 |
| 数据存储 | 微信云数据库 |
| 广告变现 | 微信激励视频广告 |

## 项目结构

```
ai-fortune-miniapp/
├── app.js              # 小程序入口
├── app.json            # 小程序配置
├── app.wxss            # 全局样式
├── pages/
│   ├── index/          # 首页（测算选择）
│   ├── result/         # 结果页
│   └── profile/        # 个人中心
├── cloudfunctions/     # 云函数
│   ├── login/          # 登录云函数
│   └── ai-analyzer/    # AI 分析云函数
├── prompts/            # AI 提示词模板
│   ├── config.js       # AI 配置
│   ├── bazi-prompt.md  # 八字提示词
│   ├── xingpan-prompt.md # 星盘提示词
│   └── tuoluo-prompt.md  # 塔罗提示词
└── static/             # 静态资源
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Yuma-st/ai-fortune-miniapp.git
cd ai-fortune-miniapp
```

### 2. 配置云开发环境

1. 打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 创建新项目，选择当前目录
3. 在 `app.js` 中配置云环境 ID
4. 在微信云开发控制台创建云环境

### 3. 配置 AI API

#### 方式一：智谱 AI（推荐）

1. 注册 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 获取 API Key
3. 在微信云开发控制台设置环境变量：
   - 变量名：`ZHIPU_API_KEY`
   - 变量值：你的 API Key

#### 方式二：OpenAI（需要翻墙）

1. 获取 OpenAI API Key
2. 在微信云开发控制台设置环境变量：
   - 变量名：`OPENAI_API_KEY`
   - 变量值：你的 API Key

### 4. 部署云函数

在微信开发者工具中：

1. 右键 `cloudfunctions` 文件夹
2. 选择 "上传并部署"
3. 依次部署 `login` 和 `ai-analyzer`

### 5. 配置广告位

1. 在微信公众平台申请广告位
2. 在代码中替换广告位 ID：
   - `pages/index/index.js` 中的 `YOUR_AD_UNIT_ID`
   - `pages/result/result.js` 中的 `YOUR_AD_UNIT_ID`

## AI 提示词调优

提示词文件位于 `prompts/` 目录：

- `bazi-prompt.md` - 八字命理提示词
- `xingpan-prompt.md` - 星盘解读提示词
- `tuoluo-prompt.md` - 塔罗占卜提示词

如需调整输出风格或内容，修改对应文件后重新部署云函数即可。

## 变现方式

- **激励视频广告**：用户观看视频获取更多分析次数
- 后续可接入：订阅会员、高级功能解锁

## 注意事项

1. 本小程序仅供娱乐参考，请勿过度依赖
2. 所有玄学内容均加有免责声明
3. 请遵守微信小程序相关规范

## License

MIT
