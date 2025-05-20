import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarNav from '@/components/shared/SidebarNav';
import AppLogo from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'AI SuperCoach',
  description: 'Your personal AI fitness companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          openSans.variable
        )}
      >
        <SidebarProvider defaultOpen={true}>
          <Sidebar className="border-r" variant="sidebar">
            <SidebarHeader className="p-4 flex justify-between items-center">
              <AppLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-4">
              <Button variant="ghost" className="w-full justify-start">
                <UserCircle className="mr-2 h-5 w-5" />
                Profile
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="flex-1">
                {/* Placeholder for breadcrumbs or page title if needed in header */}
              </div>
              {/* Add User Profile Dropdown or Settings here */}
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
