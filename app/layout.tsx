import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True-Size — Stop guessing your size",
  description:
    "Hold a credit card against your chest. Your webcam measures your shoulders and chest in inches, and tells you exactly what size to buy at Zara, H&M, Uniqlo and more. 100% in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
