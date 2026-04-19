import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TwinMind Live Suggestions',
  description: 'AI meeting copilot with live suggestions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
