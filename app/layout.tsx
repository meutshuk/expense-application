import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthLayout from "@/components/layouts/authLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import LoginRegister from "@/components/login-register";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {session ? (
          <AuthLayout>
            <Navbar userId={session.user.id} />
            <SidebarProvider>
              <Suspense>
                <Toaster />
                {children}
              </Suspense>
            </SidebarProvider>
          </AuthLayout>
        ) : (
          <LoginRegister />
        )}
      </body>
    </html>
  );
}
