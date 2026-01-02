export type Locale = 'en' | 'es';

export interface StarterPackContent {
  subject: string;
  title: string;
  subtitle: string;
  successMessage: string;
  codesTitle: string;
  codesFooter: string;
  instructionsTitle: string;
  instructions: string[];
  ctaButton: string;
  helpText: string;
  copyright: string;
}

// Super Pack uses same structure with different text
export type SuperPackContent = StarterPackContent;
