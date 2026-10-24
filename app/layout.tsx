import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miku Moe",
  description: "Miku Moe - Aplikasi Baca Manga, Manhwa, Manhua dan Nonton Anime terlengkap dengan multi-source, pembaca webtoon, riwayat & favorit.",
  openGraph: {
    title: "Miku Moe",
    description: "Miku Moe - Aplikasi Baca Manga, Manhwa, Manhua dan Nonton Anime terlengkap dengan multi-source, pembaca webtoon, riwayat & favorit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#080b12" />
      </head>
      <body className="bg-[#080b12] text-[#ece1d5] min-h-screen antialiased flex flex-col selection:bg-amber-600/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
