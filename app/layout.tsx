import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { getServerLocale } from '@/lib/i18n/get-locale';
import './globals.css';

export const metadata: Metadata = {
  title: 'ajteaches',
  description: 'Engineering, taught well.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await getServerLocale();

  return (
    <ClerkProvider>
      <html
        lang={initialLocale}
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body className="font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
