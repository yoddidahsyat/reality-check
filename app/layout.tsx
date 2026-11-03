import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./styles.css";
import LenisProvider from "@/providers/LenisProvider";
import { FormProvider } from "@/context/FormContext";
import AppFrame from "@/components/layout/AppFrame";

const sohne = localFont({
  src: [
    { path: "./fonts/Sohne-Buch.otf", weight: "400", style: "normal" },
    { path: "./fonts/Sohne-Kraftig.otf", weight: "500", style: "normal" },
  ],
  variable: "--font-sohne",
  display: "swap",
});

const agrandir = localFont({
  src: [
    { path: "./fonts/PPAgrandir-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/PPAgrandir-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-agrandir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juicebox – Reality check",
  description:
    "Compare your thoughts on technology with current industry opinions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sohne.variable} ${agrandir.variable}`}>
      <body>
        <LenisProvider>
          <FormProvider>
            <AppFrame>{children}</AppFrame>
          </FormProvider>
        </LenisProvider>
      </body>
    </html>
  );
}

