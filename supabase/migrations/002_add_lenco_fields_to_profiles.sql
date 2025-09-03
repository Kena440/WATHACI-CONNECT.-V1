-- Add Lenco-specific payment fields to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mobile_money_provider TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS bank_swift_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_currency TEXT;

