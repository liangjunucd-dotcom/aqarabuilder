import { CARDS } from "@/lib/mock/leads";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return CARDS.map(c => ({ id: c.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
