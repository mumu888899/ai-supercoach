'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {NAV_LINKS.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))}
              tooltip={{ children: link.label, className: "bg-sidebar-background text-sidebar-foreground border-sidebar-border" }}
              className={cn(
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))) &&
                  'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
