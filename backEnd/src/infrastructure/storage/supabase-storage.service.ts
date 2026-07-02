import { createClient } from '@supabase/supabase-js';
import { envConfig } from '@config/env.config';

const supabase = createClient(envConfig.supabase.url, envConfig.supabase.serviceKey);

export async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  mimetype: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(envConfig.supabase.bucket)
    .upload(filename, buffer, { contentType: mimetype, upsert: true });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(envConfig.supabase.bucket)
    .getPublicUrl(filename);

  return data.publicUrl;
}