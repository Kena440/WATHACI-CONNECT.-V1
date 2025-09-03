/**
 * User and Profile service for handling all user-related database operations
 */

import { BaseService } from './base-service';
import { supabase, withErrorHandling } from '@/lib/supabase-enhanced';
import type { 
  User, 
  Profile, 
  AccountType, 
  ProfileFilters,
  DatabaseResponse 
} from '@/@types/database';

export class UserService extends BaseService<User> {
  constructor() {
    super('auth.users');
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<DatabaseResponse<User | null>> {
    return withErrorHandling(
      async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          return { data: null, error };
        }

        if (!user) {
          return { data: null, error: null };
        }

        return {
          data: {
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          error: null
        };
      },
      'UserService.getCurrentUser'
    );
  }

  /**
   * Sign in user with email and password
   */
  async signIn(email: string, password: string): Promise<DatabaseResponse<User>> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { data: null, error };
        }

        return {
          data: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
            updated_at: data.user.updated_at
          },
          error: null
        };
      },
      'UserService.signIn'
    );
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string): Promise<DatabaseResponse<User>> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          return { data: null, error };
        }

        if (!data.user) {
          return { data: null, error: new Error('User creation failed') };
        }

        return {
          data: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
            updated_at: data.user.updated_at
          },
          error: null
        };
      },
      'UserService.signUp'
    );
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<DatabaseResponse<void>> {
    return withErrorHandling(
      async () => {
        const { error } = await supabase.auth.signOut();
        return { data: undefined, error };
      },
      'UserService.signOut'
    );
  }
}

export class ProfileService extends BaseService<Profile> {
  constructor() {
    super('profiles');
  }

  /**
   * Get profile by user ID with full details
   */
  async getByUserId(userId: string): Promise<DatabaseResponse<Profile>> {
    return withErrorHandling(
      () => supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      'ProfileService.getByUserId'
    );
  }

  /**
   * Create a new profile
   */
  async createProfile(userId: string, profileData: Partial<Profile>): Promise<DatabaseResponse<Profile>> {
    const profile = {
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_completed: false,
      ...profileData,
    };

    return this.create(profile);
  }

  /**
   * Update profile data
   */
  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<DatabaseResponse<Profile>> {
    return this.update(userId, {
      ...profileData,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Set account type for a user
   */
  async setAccountType(userId: string, accountType: AccountType): Promise<DatabaseResponse<Profile>> {
    return this.updateProfile(userId, { account_type: accountType });
  }

  /**
   * Mark profile as completed
   */
  async markProfileCompleted(userId: string): Promise<DatabaseResponse<Profile>> {
    return this.updateProfile(userId, { profile_completed: true });
  }

  /**
   * Search profiles with filters
   */
  async searchProfiles(filters: ProfileFilters = {}) {
    return withErrorHandling(
      async () => {
        let query = supabase
          .from('profiles')
          .select(`
            *,
            user:auth.users(email, created_at)
          `)
          .eq('profile_completed', true);

        // Apply filters
        if (filters.account_type) {
          query = query.eq('account_type', filters.account_type);
        }

        if (filters.country) {
          query = query.eq('country', filters.country);
        }

        if (filters.industry_sector) {
          query = query.eq('industry_sector', filters.industry_sector);
        }

        if (filters.search) {
          query = query.or(`
            business_name.ilike.%${filters.search}%,
            first_name.ilike.%${filters.search}%,
            last_name.ilike.%${filters.search}%,
            description.ilike.%${filters.search}%
          `);
        }

        const result = await query.order('updated_at', { ascending: false });
        return result;
      },
      'ProfileService.searchProfiles'
    );
  }

  /**
   * Get profiles by account type
   */
  async getByAccountType(accountType: AccountType) {
    return this.findMany({ account_type: accountType, profile_completed: true });
  }

  /**
   * Update payment information
   */
  async updatePaymentInfo(
    userId: string,
    paymentData: {
      payment_method: 'phone' | 'card' | 'bank';
      payment_phone?: string;
      mobile_money_provider?: string;
      card_details?: { number: string; expiry: string; holder_name?: string; cvv?: string };
      bank_account_name?: string;
      bank_account_number?: string;
      bank_name?: string;
      bank_branch?: string;
      bank_swift_code?: string;
      bank_currency?: string;
      use_same_phone?: boolean;
    }
  ): Promise<DatabaseResponse<Profile>> {
    return this.updateProfile(userId, paymentData);
  }

  /**
   * Update professional information
   */
  async updateProfessionalInfo(
    userId: string,
    professionalData: {
      qualifications?: Array<{ name: string; institution: string; year: number }>;
      experience_years?: number;
      specialization?: string;
      gaps_identified?: string[];
    }
  ): Promise<DatabaseResponse<Profile>> {
    return this.updateProfile(userId, professionalData);
  }

  /**
   * Update business information
   */
  async updateBusinessInfo(
    userId: string,
    businessData: {
      business_name?: string;
      registration_number?: string;
      industry_sector?: string;
      description?: string;
      website_url?: string;
      employee_count?: number;
      annual_revenue?: number;
      funding_stage?: string;
    }
  ): Promise<DatabaseResponse<Profile>> {
    return this.updateProfile(userId, businessData);
  }

  /**
   * Get user profile with subscription information
   */
  async getProfileWithSubscription(userId: string) {
    return withErrorHandling(
      () => supabase
        .from('profiles')
        .select(`
          *,
          subscriptions:user_subscriptions(
            id,
            plan_id,
            status,
            start_date,
            end_date,
            subscription_plans(name, features, category)
          )
        `)
        .eq('id', userId)
        .single(),
      'ProfileService.getProfileWithSubscription'
    );
  }

  /**
   * Check if profile is complete
   */
  async isProfileComplete(userId: string): Promise<DatabaseResponse<boolean>> {
    return withErrorHandling(
      async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('profile_completed, account_type, first_name, last_name, phone, country')
          .eq('id', userId)
          .single();

        if (error) {
          return { data: false, error };
        }

        const isComplete = profile?.profile_completed && 
                          profile?.account_type &&
                          profile?.first_name &&
                          profile?.last_name &&
                          profile?.phone &&
                          profile?.country;

        return { data: !!isComplete, error: null };
      },
      'ProfileService.isProfileComplete'
    );
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletionPercentage(userId: string): Promise<DatabaseResponse<number>> {
    return withErrorHandling(
      async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          return { data: 0, error };
        }

        if (!profile) {
          return { data: 0, error: null };
        }

        const requiredFields = [
          'account_type',
          'first_name', 
          'last_name',
          'phone',
          'country',
          'email'
        ];

        const accountTypeSpecificFields: Record<AccountType, string[]> = {
          sole_proprietor: ['business_name', 'registration_number'],
          professional: ['qualifications', 'specialization'],
          sme: ['business_name', 'registration_number', 'industry_sector'],
          investor: ['business_name', 'annual_revenue'],
          donor: ['business_name'],
          government: ['business_name', 'registration_number']
        };

        const allRequiredFields = [
          ...requiredFields,
          ...(profile.account_type ? accountTypeSpecificFields[profile.account_type] || [] : [])
        ];

        const completedFields = allRequiredFields.filter(field => {
          const value = profile[field];
          return value !== null && value !== undefined && value !== '';
        }).length;

        const percentage = Math.round((completedFields / allRequiredFields.length) * 100);

        return { data: percentage, error: null };
      },
      'ProfileService.getProfileCompletionPercentage'
    );
  }
}

// Export singleton instances
export const userService = new UserService();
export const profileService = new ProfileService();