-- 清理重复字段的安全迁移脚本
-- ⚠️ 执行前请先备份数据库

-- 1. 首先将subscription_end_at的数据迁移到subscription_expires_at（如果有数据的话）
UPDATE users 
SET subscription_expires_at = subscription_end_at 
WHERE subscription_end_at IS NOT NULL 
  AND subscription_expires_at IS NULL;

-- 2. 安全删除重复的subscription_end_at字段
ALTER TABLE users DROP COLUMN IF EXISTS subscription_end_at;

-- 3. 验证结果
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_end_at'
    ) THEN '❌ subscription_end_at字段仍然存在'
    ELSE '✅ subscription_end_at字段已删除'
  END as end_at_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_expires_at'
    ) THEN '✅ subscription_expires_at字段存在'
    ELSE '❌ subscription_expires_at字段不存在'
  END as expires_at_status;

SELECT '🎉 字段清理完成！现在只保留subscription_expires_at字段。' as result;