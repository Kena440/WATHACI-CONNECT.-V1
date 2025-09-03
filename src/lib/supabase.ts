/**
 * Legacy Supabase client export for backward compatibility
 * 
 * @deprecated Use the enhanced client from '@/lib/supabase-enhanced' for new code
 */

import { supabase as enhancedSupabase } from './supabase-enhanced';

// Export the enhanced client for backward compatibility
export { enhancedSupabase as supabase };

// Also export for direct import compatibility
export default enhancedSupabase;
