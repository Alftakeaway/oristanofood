import {
  Cormorant_Garamond,
  Inter,
  Lora,
  Montserrat,
  Playfair_Display,
} from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

export const fontRegistry = {
  'Playfair Display': playfair,
  Inter: inter,
  'Cormorant Garamond': cormorant,
  Montserrat: montserrat,
  Lora: lora,
} as const;

export type FontName = keyof typeof fontRegistry;
