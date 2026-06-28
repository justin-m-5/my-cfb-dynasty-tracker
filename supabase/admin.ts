// supabase/admin.ts

import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL).')
}

if (!supabaseSecretKey) {
  throw new Error('Missing Supabase secret key. Set SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).')
}

// Public client uses publishable key + RLS; this admin client uses a secret key for privileged server-only operations.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey
)
