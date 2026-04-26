import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "IDEAlg - IDE Online de Portugol",
  description: "Aprenda lógica de programação com Portugol direto no navegador. IDE gratuita usada na UFSM.",
  keywords: ["portugol", "algoritmos", "ufsm", "education", "ide", "programação"],
  icons: {
    icon: "/IDEAlg/favicon.svg",
  },
  openGraph: {
    title: "IDEAlg - IDE Online de Portugol",
    description: "Aprenda lógica de programação com Portugol direto no navegador.",
    url: "https://hansufsm.github.io/IDEAlg",
    siteName: "IDEAlg",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
