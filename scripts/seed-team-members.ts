/**
 * Seed script for initial team members
 *
 * This script inserts initial records into the `team_members` table.
 * It expects Supabase environment variables to be available.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const envFile = readFileSync(envPath, 'utf8');
    for (const line of envFile.split('\n')) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore if .env does not exist
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { error } = await supabase.from('team_members').upsert([
    {
      name: 'Jane Doe',
      role: 'Chief Executive Officer',
      bio: 'Visionary leader with over 10 years in the industry.',
      avatar: 'https://example.com/avatars/jane.jpg',
      expertise: ['Leadership', 'Strategy'],
      qualifications: ['MBA']
    },
    {
      name: 'John Smith',
      role: 'Chief Technology Officer',
      bio: 'Tech enthusiast focused on scalable solutions.',
      avatar: 'https://example.com/avatars/john.jpg',
      expertise: ['Engineering', 'AI'],
      qualifications: ['MSc Computer Science']
    }
  ]);

  if (error) {
    console.error('Failed to seed team_members:', error.message);
    process.exit(1);
  }

  console.log('team_members table seeded successfully');
}

seed();
