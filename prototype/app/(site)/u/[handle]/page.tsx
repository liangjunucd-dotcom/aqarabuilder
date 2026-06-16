import { ACBs } from "@/lib/mock/acbs";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return ACBs.map(a => ({ handle: a.handle }));
}

export default function Page({ params }: { params: { handle: string } }) {
  return (
    <Suspense fallback={null}>
      <ClientPage params={params} />
    </Suspense>
  );
}
