import { MyProjects } from "@/lib/mock/projects";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return MyProjects.flatMap(p => ["framing-plan","electrical-plan","plumbing-plan"].map(tid => ({ id: p.id, takeoffId: tid })));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
