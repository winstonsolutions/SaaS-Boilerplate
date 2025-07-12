-- 安全的数据库迁移脚本
-- 基于现有supabase.ts类型文件分析
-- ⚠️ 执行前请先备份数据库

-- ===================================
-- 1. 为users表添加代码中使用但类型定义中缺失的字段
-- ===================================

-- 添加subscription_tier字段 (代码中使用但类型定义中没有)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT;

-- 添加subscription_expires_at字段 (代码中使用但类型定义中没有)  
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- ===================================
-- 2. 创建subscriptions表 (代码中引用但不在类型定义中)
-- ===================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  license_id UUID REFERENCES licenses(id),
  subscription_id TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  status TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 3. 添加payments表的created_at和updated_at字段 (如果不存在)
-- ===================================

-- payments表在类型中没有这些字段，但我们的代码尝试插入它们
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ===================================
-- 4. 创建性能优化索引
-- ===================================

-- payments表索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- subscriptions表索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- users表索引
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- licenses表索引
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_active ON licenses(active);

-- ===================================
-- 5. 验证迁移结果
-- ===================================

-- 检查所有表是否存在
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN '✅ users表存在'
    ELSE '❌ users表不存在'
  END as users_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licenses') THEN '✅ licenses表存在'
    ELSE '❌ licenses表不存在'
  END as licenses_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN '✅ payments表存在'
    ELSE '❌ payments表不存在'
  END as payments_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN '✅ subscriptions表存在'
    ELSE '❌ subscriptions表不存在'
  END as subscriptions_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization') THEN '✅ organization表存在'
    ELSE '❌ organization表不存在'
  END as organization_status;

-- 检查新增字段是否存在
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_tier'
    ) THEN '✅ users.subscription_tier字段已添加'
    ELSE '❌ users.subscription_tier字段缺失'
  END as subscription_tier_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_expires_at'
    ) THEN '✅ users.subscription_expires_at字段已添加'
    ELSE '❌ users.subscription_expires_at字段缺失'
  END as subscription_expires_at_status;

SELECT '🎉 迁移完成！现在可以测试支付流程了。' as migration_result;