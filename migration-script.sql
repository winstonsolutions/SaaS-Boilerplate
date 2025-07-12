-- 安全的数据库迁移脚本
-- 警告：在生产环境执行前请先备份数据库

-- 1. 为现有users表添加新字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 2. 为现有licenses表添加新字段
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- 3. 创建payments表（如果不存在）
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  license_id UUID REFERENCES licenses(id),
  payment_id TEXT,
  subscription_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建subscriptions表（如果不存在）
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

-- 5. 创建organization表（如果不存在）
CREATE TABLE IF NOT EXISTS organization (
  id TEXT PRIMARY KEY,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_subscription_price_id TEXT,
  stripe_subscription_status TEXT,
  stripe_subscription_current_period_end BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(subscription_id);

-- 7. 验证迁移
SELECT 'Migration completed successfully' as status;