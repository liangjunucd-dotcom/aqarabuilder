import { getAllSpaceProfiles } from "@/lib/mock/space-profile";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return getAllSpaceProfiles().map(sp => ({ id: sp.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
