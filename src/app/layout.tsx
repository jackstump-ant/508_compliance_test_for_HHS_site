import type { Metadata } from "next";
import "./globals.css";
import "@trussworks/react-uswds/lib/uswds.css";
import GovernmentLayout from "@/components/layout/GovernmentLayout";

export const metadata: Metadata = {
  title: "508 Compliance Review - Document Accessibility Checker",
  description: "Submit documents for Section 508 accessibility compliance review powered by AI analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GovernmentLayout>
          {children}
        </GovernmentLayout>
      </body>
    </html>
  );
}
