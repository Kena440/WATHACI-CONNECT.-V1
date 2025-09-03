import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://wfqsmvkzkxdasbhpugdc.supabase.co';
const supabaseKey = 'sb_publishable_8rLYlRkT8hNwBs-T7jsOAQ_pJq9gtfB';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };