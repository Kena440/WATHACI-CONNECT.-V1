import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, test, expect } from 'vitest';
import { ProfileForm } from '../ProfileForm';

vi.mock('@/components/ui/button', () => ({ Button: ({ children }: any) => <button>{children}</button> }));
vi.mock('@/components/ui/input', () => ({ Input: (props: any) => <input {...props} /> }));
vi.mock('@/components/ui/label', () => ({ Label: ({ children }: any) => <label>{children}</label> }));
vi.mock('@/components/ui/textarea', () => ({ Textarea: (props: any) => <textarea {...props} /> }));
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: (props: any) => <div>{props.placeholder}</div>,
}));
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/checkbox', () => ({ Checkbox: (props: any) => <input type="checkbox" {...props} /> }));
vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioGroupItem: (props: any) => <input type="radio" {...props} />,
}));
vi.mock('@/components/CountrySelect', () => ({ CountrySelect: () => <div /> }));
vi.mock('@/components/AddressInput', () => ({ AddressInput: () => <div /> }));
vi.mock('@/components/QualificationsInput', () => ({ QualificationsInput: () => <div /> }));
vi.mock('@/components/ImageUpload', () => ({ ImageUpload: () => <div /> }));
vi.mock('lucide-react', () => ({ ArrowLeft: () => <div /> }));
vi.mock('../../data/countries', () => ({ sectors: ['Tech'], countries: [{ name: 'Testland', phoneCode: '+1' }] }));

const noop = () => {};

test('ProfileForm has no accessibility violations', async () => {
  const { container } = render(
    <ProfileForm accountType="professional" onSubmit={noop} onPrevious={noop} loading={false} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
