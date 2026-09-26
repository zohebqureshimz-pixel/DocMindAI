"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getProfile();

        if (user.role !== "ADMIN") {
          router.replace("/workspace");
          return;
        }

        setCheckingRole(false);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("access_token");
        router.replace("/signup");
      }
    }

    checkAdmin();
  }, [router]);

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Checking permissions...
      </div>
    );
  }

  return <>{children}</>;
}