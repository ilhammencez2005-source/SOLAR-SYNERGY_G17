import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solar Synergy",
  description: "Solar Synergy: Advanced micro-mobility charging platform for UTP. Features sustainable solar charging, secure Bluetooth hub control, and AI-powered synergy assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 h-screen w-full overflow-hidden">
          <header className="fixed top-4 right-4 z-[100]">
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Sign Up</button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
