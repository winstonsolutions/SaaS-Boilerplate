import { supabaseAdmin } from './Supabase';

// 导出直接使用的supabase客户端实例
// 在服务器端组件中使用这个客户端
export const db = supabaseAdmin;

// 用户相关操作
export type User = {
  id?: string;
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  trial_started_at?: Date;
};

// 获取用户
export async function getUser(clerkId: string) {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  } // PGRST116是未找到记录的错误码
  return data;
}

// 通过邮箱获取用户
export async function getUserByEmail(email: string) {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

// 创建用户
export async function createUser(user: User) {
  const { data, error } = await db
    .from('users')
    .insert([{
      ...user,
      updated_at: new Date(),
    }])
    .select();

  if (error) {
    throw error;
  }
  return data[0];
}

// 更新用户
export async function updateUser(id: string, userData: Partial<User>) {
  const { data, error } = await db
    .from('users')
    .update({
      ...userData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }
  return data[0];
}

// 删除用户
export async function deleteUser(clerkId: string) {
  const user = await getUser(clerkId);
  if (!user) {
    return null;
  }

  const { error } = await db
    .from('users')
    .delete()
    .eq('clerk_id', clerkId);

  if (error) {
    throw error;
  }
  return user;
}

// License相关操作
export type License = {
  id?: string;
  user_id?: string;
  license_key: string;
  expires_at?: Date;
  active?: boolean;
  email?: string;
};

// 获取license
export async function getLicense(licenseKey: string) {
  const { data, error } = await db
    .from('licenses')
    .select('*')
    .eq('license_key', licenseKey)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

// 获取用户的所有licenses
export async function getUserLicenses(userId: string) {
  const { data, error } = await db
    .from('licenses')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
  return data;
}

// 创建license
export async function createLicense(license: License) {
  const { data, error } = await db
    .from('licenses')
    .insert([{
      ...license,
      updated_at: new Date(),
    }])
    .select();

  if (error) {
    throw error;
  }
  return data[0];
}

// 更新license
export async function updateLicense(id: string, licenseData: Partial<License>) {
  const { data, error } = await db
    .from('licenses')
    .update({
      ...licenseData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }
  return data[0];
}

// 激活或停用license
export async function setLicenseStatus(id: string, active: boolean) {
  return updateLicense(id, { active });
}
