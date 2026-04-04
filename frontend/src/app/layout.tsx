import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AfriStore: Online stores for African entrepreneurs & makers',
  description:
    'Ecommerce for Africans: tailors, fashion, makers, and service businesses get storefronts, Paystack, paths toward mobile money, and phone first templates.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans min-h-screen" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
