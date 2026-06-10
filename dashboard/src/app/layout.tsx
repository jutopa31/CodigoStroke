import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Código Stroke — Analytics",
  description: "Dashboard de métricas de calidad asistencial ACV",
};

// Tema claro fijo: emite <meta name="color-scheme" content="light"> para que el
// navegador no aplique modo oscuro automático sobre la UI.
export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
