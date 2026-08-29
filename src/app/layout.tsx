import type { Metadata } from "next";
import Script from "next/script";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { FloatingSuggestionWidget } from "@/components/suggestions/FloatingSuggestionWidget";
import { FloatingLeadCopilotWidget } from "@/components/copilot/FloatingLeadCopilotWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Nexus",
  description: "Plataforma Comercial Consultiva B2B",
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FloatingLeadCopilotWidget />
            <FloatingSuggestionWidget />
          </AuthProvider>
        </ThemeProvider>
        <Script
          id="devtools-blocker"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Disable context menu (right-click)
              document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
              });

              // Block DevTools shortcut keys (best-effort)
              document.addEventListener('keydown', (e) => {
                // F12
                if (e.key === 'F12') {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }
                // Ctrl/Cmd + Shift + I / J / C
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }
                // Ctrl/Cmd + U (view source)
                if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }
                // Ctrl/Cmd + P (print)
                if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }
                // Ctrl/Cmd + S (save)
                if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }
                // Backspace navigation (Chrome)
                if (e.key === 'Backspace' && !('value' in e.target) && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  return false;
                }
              });

              // Disable drag for images and links (no downloads of assets)
              document.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
              });
            `,
          }}
        />
      </body>
    </html>
  );
}