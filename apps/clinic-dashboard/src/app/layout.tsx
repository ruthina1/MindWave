import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "MindWave Clinic Dashboard",
  description: "B2B Professional dashboard for psychiatrists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
