// config/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// URL e chave pública do seu projeto Supabase
const supabaseUrl = 'https://vhprbdhupkirwyntwhjn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHJiZGh1cGtpcnd5bnR3aGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzkzODAsImV4cCI6MjA3NDg1NTM4MH0.TyxsMrQeNuc6CTLIksK1_2gg3KAixPTCNYQRPtxS-Ss'

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)
