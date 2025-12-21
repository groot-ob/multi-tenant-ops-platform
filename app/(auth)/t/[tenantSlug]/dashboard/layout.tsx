import { UnauthorizedModal } from "@/components/auth/UnAuthorizedModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UnauthorizedModal />
      <main>{children}</main>
    </>
  );
}