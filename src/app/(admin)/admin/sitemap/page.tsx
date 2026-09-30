import { SitemapClient } from "@/components/admin/SitemapClient";

export const metadata = {
  title: "Sitemap Manager | BookMyGlobal Admin",
  description: "Manage, customize, and sync live sitemap.xml entries with search engines.",
};

export default function AdminSitemapPage() {
  return <SitemapClient />;
}
