export type OperatingModel =
  | 'Service-Based'
  | 'Product-Based'
  | 'DeepTech Startup'
  | 'Enterprise'
  | '';

export interface CompanyOnboardingPayload {
  recruiterName: string;
  corporateEmail: string;
  contactNumber: string;
  companyName: string;
  companyPurpose: string;
  operatingModel: OperatingModel;
  establishmentYear: string;
  industry: string;
  cin: string;
  website: string;
  headquarters: string;
  allowAlumniReferrals: boolean;
  allowInterviewBank: boolean;
  verificationStatus?: 'Verified' | 'Pending Review' | 'Unverified';
  submittedAt?: string;
}

export const OPERATING_MODELS: {
  value: OperatingModel;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    value: 'Product-Based',
    label: 'Product-Based',
    badge: 'SaaS & Platforms',
    description: 'Proprietary software, platforms, or consumer tech products.',
  },
  {
    value: 'DeepTech Startup',
    label: 'DeepTech Startup',
    badge: 'AI & Research',
    description: 'Cutting-edge innovation in AI, ML, robotics, or hardware.',
  },
  {
    value: 'Enterprise',
    label: 'Enterprise',
    badge: 'Fortune 500 / GCC',
    description: 'Large multinational corporation or Global Capability Center.',
  },
  {
    value: 'Service-Based',
    label: 'Service-Based',
    badge: 'IT Services & Consulting',
    description: 'Client delivery, digital transformation, and staff augmentation.',
  },
];

export const INDUSTRY_SECTORS: string[] = [
  'FinTech & Digital Banking',
  'AI, Machine Learning & Robotics',
  'Enterprise SaaS & Cloud Infrastructure',
  'CyberSecurity & Identity Systems',
  'HealthTech & BioInformatics',
  'E-Commerce & Supply Chain',
  'Automotive & Autonomous Systems',
  'IT Consulting & Digital Services',
  'EdTech & Future of Work',
  'CleanTech & Renewable Energy',
];

export const PUBLIC_EMAIL_DOMAINS: string[] = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'aol.com',
  'mail.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
];

/**
 * Validates if an email address is a legitimate corporate domain
 * and not a public/consumer email provider.
 */
export function validateCorporateEmail(email: string): {
  isValid: boolean;
  domain: string;
  error?: string;
} {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, domain: '', error: 'Corporate email is required.' };
  }
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, domain: '', error: 'Enter a valid email address.' };
  }
  const domain = parts[1];
  if (!domain.includes('.')) {
    return { isValid: false, domain, error: 'Domain must have a valid extension (e.g. .com, .io).' };
  }
  if (PUBLIC_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      domain,
      error: `Public domain (@${domain}) rejected. DRISHTI requires an official corporate domain (e.g., hr@${domain.replace(
        /^(gmail|yahoo|hotmail|outlook)\.com$/,
        'company.com'
      )}) to verify hiring legitimacy.`,
    };
  }
  return { isValid: true, domain };
}

export function createDefaultCompanyPayload(): CompanyOnboardingPayload {
  return {
    recruiterName: 'Priya Sharma',
    corporateEmail: 'priya.sharma@finnable.com',
    contactNumber: '+91 98234 56789',
    companyName: 'Finnable Credit',
    companyPurpose:
      'AI-driven fintech platform empowering salaried professionals with instant, paperless credit solutions, automated underwriting, and micro-savings infrastructure.',
    operatingModel: 'Product-Based',
    establishmentYear: '2018',
    industry: 'FinTech & Digital Banking',
    cin: 'U65999KA2018PTC112345',
    website: 'https://www.finnable.com',
    headquarters: 'Bengaluru / Pune, India',
    allowAlumniReferrals: true,
    allowInterviewBank: true,
    verificationStatus: 'Verified',
    submittedAt: '2026-03-15T10:30:00Z',
  };
}
