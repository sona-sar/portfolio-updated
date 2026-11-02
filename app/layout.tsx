import type { Metadata } from "next";
import { Single_Day } from "next/font/google";
import "./globals.css";

const hand = Single_Day({
  weight: "400",
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "Sona Sargsyan",
  description: "Software Engineer at Snap. Walk through my notebook to see my story.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hand.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
