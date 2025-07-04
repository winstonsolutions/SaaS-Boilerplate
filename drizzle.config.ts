import { defineConfig } from 'drizzle-kit';

// 配置Drizzle与Supabase一起使用
export default defineConfig({
  out: './migrations',
  schema: './src/models/Schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // 使用环境变量中的数据库URL，可以是DATABASE_URL或通过Supabase环境变量构造
    url: process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `postgresql://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}`
      : '',
  },
  verbose: true,
  strict: true,
});
