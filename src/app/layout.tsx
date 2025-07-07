import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/providers/ToastProvider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VetFlow - Gestion vétérinaire moderne",
  description: "Solution de gestion pour cabinets vétérinaires",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Script d'initialisation du thème pour éviter le FOUC avec Tailwind v4
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  console.log('🎨 Script init - Thème:', shouldBeDark ? 'dark' : 'light');
                } catch (e) {
                  console.warn('Erreur initialisation thème:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-stone-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
