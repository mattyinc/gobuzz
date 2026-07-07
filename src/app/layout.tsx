import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const mackinac = localFont({
  variable: "--font-mackinac",
  src: [
    { path: "../fonts/P22MackinacPro-Book_25.otf", weight: "400", style: "normal" },
    { path: "../fonts/P22MackinacPro-BookItalic_15.otf", weight: "400", style: "italic" },
    { path: "../fonts/P22MackinacPro-Medium_26.otf", weight: "500", style: "normal" },
    { path: "../fonts/P22MackinacPro-MedItalic_18.otf", weight: "500", style: "italic" },
    { path: "../fonts/P22MackinacPro-Bold_16.otf", weight: "700", style: "normal" },
    { path: "../fonts/P22MackinacPro-BoldItalic_11.otf", weight: "700", style: "italic" },
  ],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Go'Buzz Wellness — Sauna & Ice Bath Club, Addis Ababa",
  description:
    "Addis Ababa's private wellness club. Saunas, ice baths, and recovery — book your session at Go'Buzz. Move. Think. Recover.",
};

// Applies the saved theme before first paint so neither mode flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("gobuzz-theme");if(t==="light"){document.documentElement.classList.remove("dark")}else if(t==="dark"){document.documentElement.classList.add("dark")}else if(window.matchMedia("(prefers-color-scheme: light)").matches){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${mackinac.variable} ${manrope.variable} dark h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
