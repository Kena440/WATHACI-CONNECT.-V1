// Mock import.meta for Jest environment
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'test_url',
        VITE_SUPABASE_KEY: 'test_key',
        DEV: false,
        NODE_ENV: 'test',
        MODE: 'test'
      }
    }
  }
});