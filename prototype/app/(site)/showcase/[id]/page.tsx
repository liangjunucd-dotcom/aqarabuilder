import { Showcases } from "@/lib/mock/showcases";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return Showcases.map(s => ({ id: s.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <ClientPage params={params} />
    </Suspense>
  );
}
