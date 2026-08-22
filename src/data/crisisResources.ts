export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
}

export const SELF_HARM_RESOURCES: CrisisResource[] = [
  {
    name: '988 Suicide & Crisis Lifeline (US)',
    contact: 'Call or text 988',
    description: 'Free, confidential support 24/7 for people in suicidal crisis or emotional distress.',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741 (US/Canada)',
    description: 'Free 24/7 support via text message with a trained crisis counselor.',
  },
  {
    name: 'International Association for Suicide Prevention',
    contact: 'https://www.iasp.info/resources/Crisis_Centres/',
    description: 'Directory of crisis centers outside the US.',
  },
];

export const ABUSE_RESOURCES: CrisisResource[] = [
  {
    name: 'National Domestic Violence Hotline (US)',
    contact: 'Call 1-800-799-7233 or text START to 88788',
    description: 'Confidential support 24/7 for anyone experiencing domestic violence or abuse.',
  },
  {
    name: 'National Sexual Assault Hotline (US)',
    contact: '1-800-656-4673',
    description: 'Free, confidential support 24/7, operated by RAINN.',
  },
  {
    name: 'Childhelp National Child Abuse Hotline',
    contact: '1-800-422-4453',
    description: '24/7 support for child abuse situations, for both children and concerned adults.',
  },
];

export const IMMEDIATE_DANGER_RESOURCES: CrisisResource[] = [
  {
    name: 'Emergency Services',
    contact: 'Call your local emergency number (911 in the US)',
    description: 'If you or someone else is in immediate physical danger, contact emergency services now.',
  },
];
