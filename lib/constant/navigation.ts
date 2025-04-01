export const mainNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leads Sources", href: "/leads-sources" },
  { name: "Leads", href: "/leads" },
  { name: "Contact", href: "/contact" },
  { name: "Analytics", href: "/analytics" },
] as const;

export type NavigationItem = (typeof mainNavigation)[number];
