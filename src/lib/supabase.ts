import { createClient } from '@supabase/supabase-js';

// ⚠️ Эти ключи публичные и безопасны для клиента.
// Supabase использует RLS (Row Level Security) для защиты данных.
// Замени значения ниже на свои после создания проекта в Supabase.

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
