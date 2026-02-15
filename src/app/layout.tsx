import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
    metadataBase: new URL('https://lupacomun.cl'),
    title: "LupaComún | Auditoría Forense con IA para Edificios",
    description: "Detecta irregularidades, sobreprecios y falta de transparencia en tus gastos comunes de forma instantánea con tecnología IA.",
    openGraph: {
        title: "LupaComún - Transparencia Total en tu Comunidad",
        description: "Auditoría forense impulsada por IA para detectar fraudes y sobreprecios en gastos comunes.",
        url: 'https://lupacomun.cl',
        siteName: 'LupaComún',
        locale: 'es_CL',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark">
            <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
