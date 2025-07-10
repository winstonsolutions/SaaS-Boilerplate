# PDF Pro 订阅系统实现

本文档概述了为PDF Pro应用程序实现的订阅系统。这是一个完整的端到端解决方案，包括后端服务、API端点和前端组件。

## 功能概述

- 用户可以开始7天免费试用期
- 用户可以订阅月度计划（$1.99/月）
- 支持通过Stripe进行支付处理
- 使用许可证密钥系统激活订阅
- 发送电子邮件通知（试用开始、试用即将结束、订阅确认等）
- 自动检查和更新订阅状态
- 根据订阅状态显示不同的UI和功能

## 技术栈

- **后端**：Next.js API Routes
- **数据库**：Supabase (PostgreSQL)
- **支付处理**：Stripe
- **邮件服务**：Resend
- **身份验证**：Clerk
- **前端框架**：React, Tailwind CSS

## 系统架构

### 类型定义

- `src/types/Subscription.ts` - 定义订阅状态、用户订阅、许可证等类型

### 核心服务

- `src/libs/LicenseService.ts` - 处理许可证的生成、验证和激活
- `src/libs/SubscriptionService.ts` - 管理用户订阅状态
- `src/libs/EmailService.ts` - 处理所有与订阅相关的电子邮件
- `src/libs/StripeService.ts` - 处理支付和Stripe集成

### API端点

- `/api/user/status` - 获取用户订阅状态
- `/api/license/activate` - 激活许可证密钥
- `/api/payment/create-checkout` - 创建Stripe结账会话
- `/api/webhooks/stripe` - 处理Stripe webhook回调
- `/api/cron/check-subscriptions` - 定时检查订阅状态

### 前端组件

- `src/features/dashboard/LicenseActivation.tsx` - 许可证激活表单
- `src/features/dashboard/SubscriptionStatus.tsx` - 订阅状态显示
- `src/app/[locale]/(auth)/pricing/page.tsx` - 订阅价格和购买页面

## 订阅流程

### 试用流程

1. 用户注册后自动开始7天免费试用
2. 系统发送试用开始邮件
3. 试用结束前3天发送提醒邮件
4. 试用结束后状态自动更新为已过期

### 付费订阅流程

1. 用户点击"订阅"按钮
2. 重定向到Stripe结账页面
3. 支付成功后，系统创建许可证密钥
4. 系统通过邮件发送许可证密钥给用户
5. 用户在仪表板激活许可证密钥
6. 系统验证并激活订阅

### 订阅续订/过期流程

1. 订阅过期前7天发送提醒邮件
2. 订阅过期后状态自动更新为已过期
3. 用户可以通过购买新的订阅续订

## 数据库结构

### users 表

- `id` - 用户ID
- `clerk_id` - Clerk认证ID
- `email` - 用户邮箱
- `first_name` - 名字
- `last_name` - 姓氏
- `trial_started_at` - 试用开始时间
- `subscription_status` - 订阅状态（trial/pro/expired/inactive）
- `subscription_start_at` - 订阅开始时间
- `subscription_end_at` - 订阅结束时间
- `created_at` - 创建时间
- `updated_at` - 更新时间

### licenses 表

- `id` - 许可证ID
- `user_id` - 用户ID
- `license_key` - 许可证密钥
- `expires_at` - 过期时间
- `active` - 是否激活
- `plan_type` - 计划类型（monthly/yearly）
- `email` - 关联邮箱
- `created_at` - 创建时间
- `updated_at` - 更新时间

### payments 表

- `id` - 支付ID
- `user_id` - 用户ID
- `license_id` - 许可证ID
- `payment_id` - 支付平台ID
- `amount` - 支付金额
- `currency` - 货币
- `status` - 支付状态
- `payment_date` - 支付时间

## 环境变量配置

```
# Stripe配置
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 邮件配置
RESEND_API_KEY=re_...
EMAIL_DOMAIN=example.com

# 应用URL
NEXT_PUBLIC_APP_URL=https://app.example.com

# Cron任务API密钥
CRON_API_KEY=cron_...
```

## 部署注意事项

1. 确保Stripe webhook正确配置，指向`/api/webhooks/stripe`
2. 设置Cron任务每天调用`/api/cron/check-subscriptions`
3. 配置Resend邮件服务
4. 更新Stripe价格ID和产品配置
