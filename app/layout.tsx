import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insider Market",
  description: "Browser-based crypto investing simulator game with insider leaks and fictional market dynamics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
