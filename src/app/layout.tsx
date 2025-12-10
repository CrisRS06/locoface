import type { Metadata, Viewport } from "next";
import { Outfit, Fredoka } from "next/font/google";
import "./globals.css";
import { ChristmasProvider } from "@/contexts/ChristmasContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Playful font for headings - Gen Z aesthetic
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f14" },
  ],
};

export const metadata: Metadata = {
  title: "Locoface - Turn Your Photo Into Cute Stickers",
  description:
    "Transform any selfie into adorable chibi kawaii stickers with AI. No account needed. Ready in seconds.",
  metadataBase: new URL("https://locoface.com"),
  keywords: [
    "AI sticker maker",
    "chibi sticker",
    "kawaii sticker",
    "photo to sticker",
    "cute sticker generator",
    "anime sticker",
  ],
  authors: [{ name: "Locoface" }],
  creator: "Locoface",
  publisher: "Locoface",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://locoface.com",
    siteName: "Locoface",
    title: "Locoface - Turn Your Photo Into Cute Stickers",
    description:
      "Transform any selfie into adorable chibi kawaii stickers with AI. No account needed. Ready in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1000,
        height: 528,
        alt: "Locoface - AI Sticker Maker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Locoface - Turn Your Photo Into Cute Stickers",
    description:
      "Transform any selfie into adorable chibi kawaii stickers with AI. No account needed. Ready in seconds.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Locoface",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://sdk.onvopay.com" />
      </head>
      <body className={`${outfit.variable} ${fredoka.variable} font-sans antialiased`}>
        <ChristmasProvider>
          {children}
        </ChristmasProvider>

        {/* Onvo Pay SDK is loaded dynamically by useOnvoPay hook */}
      </body>
    </html>
  );
}

// Type declaration for Onvo Pay is in src/hooks/useOnvoPay.ts
