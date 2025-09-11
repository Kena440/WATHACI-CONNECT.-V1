import { 
  validateZambianPhone, 
  formatZambianPhone, 
  getPhoneProvider, 
  getExampleNumbers,
  ZAMBIAN_PROVIDERS 
} from '../phoneValidation';

describe('Phone Validation Utilities', () => {
  describe('validateZambianPhone', () => {
    // MTN tests
    test('validates MTN numbers correctly', () => {
      expect(validateZambianPhone('0967123456').isValid).toBe(true);
      expect(validateZambianPhone('0767123456').isValid).toBe(true);
      expect(validateZambianPhone('+260967123456').isValid).toBe(true);
      expect(validateZambianPhone('260 076 712 3456').isValid).toBe(true);
    });
    
    // Airtel tests  
    test('validates Airtel numbers correctly', () => {
      expect(validateZambianPhone('0977123456').isValid).toBe(true);
      expect(validateZambianPhone('0777123456').isValid).toBe(true);
      expect(validateZambianPhone('+260977123456').isValid).toBe(true);
      expect(validateZambianPhone('260 077 712 3456').isValid).toBe(true);
    });
    
    // Zamtel tests
    test('validates Zamtel numbers correctly', () => {
      expect(validateZambianPhone('0957123456').isValid).toBe(true);
      expect(validateZambianPhone('+260957123456').isValid).toBe(true);
      expect(validateZambianPhone('260 095 712 3456').isValid).toBe(true);
    });
    
    // Invalid numbers
    test('rejects invalid numbers', () => {
      expect(validateZambianPhone('0987123456').isValid).toBe(false); // Invalid prefix
      expect(validateZambianPhone('097123456').isValid).toBe(false);  // Too short
      expect(validateZambianPhone('09771234567').isValid).toBe(false); // Too long
      expect(validateZambianPhone('').isValid).toBe(false);           // Empty
      expect(validateZambianPhone('abcdefghij').isValid).toBe(false); // Non-numeric
    });
    
    // Provider-specific validation
    test('validates against specific providers', () => {
      const result = validateZambianPhone('0967123456', 'mtn');
      expect(result.isValid).toBe(true);
      expect(result.provider?.code).toBe('mtn');
      
      const invalidResult = validateZambianPhone('0977123456', 'mtn');
      expect(invalidResult.isValid).toBe(false);
    });
    
    // Error messages
    test('provides appropriate error messages', () => {
      const shortNumber = validateZambianPhone('097123');
      expect(shortNumber.message).toContain('9 digits long');
      
      const invalidPrefix = validateZambianPhone('0987123456');
      expect(invalidPrefix.message).toContain('Must start with');
    });
  });
  
  describe('formatZambianPhone', () => {
    test('formats phone numbers correctly', () => {
      expect(formatZambianPhone('0967123456')).toBe('+260 967123456');
      expect(formatZambianPhone('+260967123456')).toBe('+260 967123456');
      expect(formatZambianPhone('260967123456')).toBe('+260 967123456');
      expect(formatZambianPhone('260 967 123 456')).toBe('+260 967123456');
    });
  });
  
  describe('getPhoneProvider', () => {
    test('returns correct provider for valid numbers', () => {
      expect(getPhoneProvider('0967123456')?.code).toBe('mtn');
      expect(getPhoneProvider('0767123456')?.code).toBe('mtn');
      expect(getPhoneProvider('0977123456')?.code).toBe('airtel');
      expect(getPhoneProvider('0777123456')?.code).toBe('airtel');
      expect(getPhoneProvider('0957123456')?.code).toBe('zamtel');
    });
    
    test('returns null for invalid numbers', () => {
      expect(getPhoneProvider('0987123456')).toBeNull();
      expect(getPhoneProvider('invalid')).toBeNull();
    });
  });
  
  describe('getExampleNumbers', () => {
    test('returns examples for all providers', () => {
      const examples = getExampleNumbers();
      expect(examples).toHaveLength(3);
      
      const mtnExamples = examples.find(e => e.provider === 'MTN Mobile Money');
      expect(mtnExamples?.examples).toContain('096XXXXXX');
      expect(mtnExamples?.examples).toContain('076XXXXXX');
      
      const airtelExamples = examples.find(e => e.provider === 'Airtel Money');
      expect(airtelExamples?.examples).toContain('097XXXXXX');
      expect(airtelExamples?.examples).toContain('077XXXXXX');
      
      const zamtelExamples = examples.find(e => e.provider === 'Zamtel Kwacha');
      expect(zamtelExamples?.examples).toContain('095XXXXXX');
    });
  });
  
  describe('ZAMBIAN_PROVIDERS constant', () => {
    test('contains all required providers', () => {
      expect(ZAMBIAN_PROVIDERS).toHaveLength(3);
      
      const mtn = ZAMBIAN_PROVIDERS.find(p => p.code === 'mtn');
      expect(mtn?.patterns).toEqual(['96', '76']);
      
      const airtel = ZAMBIAN_PROVIDERS.find(p => p.code === 'airtel');
      expect(airtel?.patterns).toEqual(['97', '77']);
      
      const zamtel = ZAMBIAN_PROVIDERS.find(p => p.code === 'zamtel');
      expect(zamtel?.patterns).toEqual(['95']);
    });
  });
});