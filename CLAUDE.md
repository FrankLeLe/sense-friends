# SecondMe Integration Project

## 项目概述
集成 SecondMe OAuth 登录和 API 的 Next.js 应用。

## 技术栈
- Next.js (App Router)
- Prisma + SQLite
- SecondMe OAuth2 + API

## 已启用模块
- **auth**: OAuth2 登录/登出
- **profile**: 用户信息、兴趣标签、软记忆
- **chat**: 与 SecondMe AI 对话

## 配置文件
- `.secondme/state.json` - 项目配置（含敏感信息，勿提交）
- `.env.local` - 环境变量

## SecondMe API 要点
- 所有响应格式: `{ code: 0, data: { ... } }`
- Token 交换使用 `application/x-www-form-urlencoded`
- OAuth URL 直接拼接参数，不追加 `/authorize`
- 响应字段使用 camelCase（accessToken 而非 access_token）

## 设计原则
- 亮色主题，简约优雅
- 中文界面
- 稳定优先，避免复杂动画
