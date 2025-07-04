import { createClient } from '@supabase/supabase-js';

import { Env } from './Env';

// 创建服务端使用的Supabase客户端，使用service role key以获取完整权限
export const supabaseAdmin = createClient(
  Env.SUPABASE_URL || Env.NEXT_PUBLIC_SUPABASE_URL || '',
  Env.SUPABASE_SERVICE_ROLE_KEY,
);

// 创建客户端使用的Supabase客户端，使用anon key
export const supabaseClient = createClient(
  Env.NEXT_PUBLIC_SUPABASE_URL,
  Env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
