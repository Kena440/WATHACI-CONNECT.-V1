/**
 * Phone validation utilities for Zambian mobile providers
 */

export interface ZambianProvider {
  name: string;
  code: string;
  patterns: string[];
}

export const ZAMBIAN_PROVIDERS: ZambianProvider[] = [
  {
    name: 'MTN Mobile Money',
    code: 'mtn',
    patterns: ['96', '76']  // Without the leading 0
  },
  {
    name: 'Airtel Money', 
    code: 'airtel',
    patterns: ['97', '77']  // Without the leading 0
  },
  {
    name: 'Zamtel Kwacha',
    code: 'zamtel', 
    patterns: ['95']        // Without the leading 0
  }
];

/**
 * Validates if a phone number matches Zambian mobile provider patterns
 * @param phoneNumber - The phone number to validate (can include +260 or not)
 * @param provider - Optional specific provider to validate against
 * @returns Object with validation result and provider info
 */
export function validateZambianPhone(phoneNumber: string, provider?: string) {
  // Clean the phone number - remove spaces, +, (), etc.
  const cleaned = phoneNumber.replace(/[\s+()-]/g, '');
  
  // Remove country code if present
  let localNumber = cleaned;
  if (cleaned.startsWith('260')) {
    localNumber = cleaned.substring(3);
  }
  
  // Remove leading 0 if present (local format)
  if (localNumber.startsWith('0')) {
    localNumber = localNumber.substring(1);
  }
  
  // Check if number has valid length (9 digits after removing 0)
  if (localNumber.length !== 9) {
    return {
      isValid: false,
      provider: null,
      message: 'Phone number must be 9 digits long (excluding leading 0 and country code)'
    };
  }
  
  // Check if it starts with a valid prefix
  const prefix = localNumber.substring(0, 2);
  
  // If specific provider is requested, only check that provider
  if (provider) {
    const providerData = ZAMBIAN_PROVIDERS.find(p => p.code === provider);
    if (!providerData) {
      return {
        isValid: false,
        provider: null,
        message: 'Invalid provider specified'
      };
    }
    
    const isValidForProvider = providerData.patterns.includes(prefix);
    return {
      isValid: isValidForProvider,
      provider: isValidForProvider ? providerData : null,
      message: isValidForProvider ? 'Valid phone number' : `Invalid ${providerData.name} number. Must start with 0${providerData.patterns.join(' or 0')}`
    };
  }
  
  // Check against all providers
  for (const providerData of ZAMBIAN_PROVIDERS) {
    if (providerData.patterns.includes(prefix)) {
      return {
        isValid: true,
        provider: providerData,
        message: 'Valid phone number'
      };
    }
  }
  
  // No valid provider found
  const allPatterns = ZAMBIAN_PROVIDERS.flatMap(p => p.patterns.map(pattern => '0' + pattern)).join(', ');
  return {
    isValid: false,
    provider: null,
    message: `Invalid phone number. Must start with: ${allPatterns}`
  };
}

/**
 * Formats a Zambian phone number with proper country code
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with +260 prefix
 */
export function formatZambianPhone(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/[\s+()-]/g, '');
  let localNumber = cleaned;
  
  if (cleaned.startsWith('260')) {
    localNumber = cleaned.substring(3);
  }
  
  // Remove leading 0 if present
  if (localNumber.startsWith('0')) {
    localNumber = localNumber.substring(1);
  }
  
  return `+260 ${localNumber}`;
}

/**
 * Gets the provider for a given phone number
 * @param phoneNumber - The phone number to check
 * @returns The provider data or null if not found
 */
export function getPhoneProvider(phoneNumber: string): ZambianProvider | null {
  const result = validateZambianPhone(phoneNumber);
  return result.provider;
}

/**
 * Generates example numbers for all providers
 * @returns Array of example phone numbers
 */
export function getExampleNumbers(): { provider: string; examples: string[] }[] {
  return ZAMBIAN_PROVIDERS.map(provider => ({
    provider: provider.name,
    examples: provider.patterns.map(pattern => `0${pattern}XXXXXX`)
  }));
}