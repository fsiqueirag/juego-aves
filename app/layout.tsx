import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adiviná el Ave",
  description: "Entrenamiento de identificación de aves argentinas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
