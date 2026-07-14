import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "THE VAULT — Futures Prop Terminal",
  description: "PRB v1 strategy operations, prop account tracking, and Monte Carlo lab",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
