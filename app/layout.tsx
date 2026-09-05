import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://assessment.warithep.website"),
  title: "ระบบประเมินพนักงาน | วารีเทพ",
  description: "ระบบประเมินผลพนักงาน บริษัท วารีเทพ จำกัด",
  openGraph: {
    title: "ระบบประเมินพนักงาน | วารีเทพ",
    description: "ระบบประเมินผลพนักงาน บริษัท วารีเทพ จำกัด",
    url: "https://assessment.warithep.website",
    siteName: "ระบบประเมินพนักงาน | วารีเทพ",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}