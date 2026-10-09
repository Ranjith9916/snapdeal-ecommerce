import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  'https://aivnkthmhbktssdtqsgl.supabase.co'

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdm5rdGhtaGJrdHNzZHRxc2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NzgwODAsImV4cCI6MjEwMjI1NDA4MH0._Re-Oh4pjbirIbmXmdkXs5r54A75Zn1HeDTX8cfzhFE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

