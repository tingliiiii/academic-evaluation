import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

// 載入設計系統指定字體
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"], // 專注於粗體/極粗體以呈現黏土的厚實感
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "期末評語生成系統",
  description: "我是生成期末評語小幫手",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${nunito.variable} ${dmSans.variable} h-full antialiased`}
    >
      {/* 套用畫布底色與預設內文字體 */}
      <body className="font-sans min-h-screen flex flex-col w-full bg-clay-canvas text-clay-foreground overflow-x-hidden selection:bg-clay-accent/20">
        
        {/* 建立黏土環境的背景環境光源 (3D Blobs) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-[10%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-clay-accent/10 blur-3xl animate-clay-float" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-clay-secondary/10 blur-3xl animate-clay-float-delayed" />
          <div className="absolute top-[20%] right-[10%] h-[40vh] w-[40vh] rounded-full bg-clay-tertiary/10 blur-3xl animate-clay-float" style={{ animationDelay: '2s' }} />
        </div>

        <Navbar />
        <main className="flex-1 w-full relative z-10">{children}</main>
      </body>
    </html>
  );
}