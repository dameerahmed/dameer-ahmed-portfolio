import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dameer Ahmed | Data Scientist & AI Agent Developer",
  description: "Futuristic Cyberpunk Portfolio showcasing projects in AI, Data Science, and Machine Learning.",
  openGraph: {
    title: "Dameer Ahmed Malik - Portfolio",
    description: "Futuristic Cyberpunk AI Portfolio",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased bg-black text-white selection:bg-cyan-500 selection:text-black`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
