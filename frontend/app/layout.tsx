import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'FootyMind - Smart Football RAG Chatbot',
  description: 'An AI-powered football chatbot running on LlamaIndex and Groq, built to answer questions on ISL, FIFA World Cup, UCL, and football rules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
