import { LIFE_PLUGINS } from "@/lib/mock/life-plugins";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return LIFE_PLUGINS.map(p => ({ id: p.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
