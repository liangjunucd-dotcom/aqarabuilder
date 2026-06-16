import { SOLUTIONS } from "@/lib/mock/solutions";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return SOLUTIONS.map(s => ({ id: s.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <ClientPage params={params} />
    </Suspense>
  );
}
