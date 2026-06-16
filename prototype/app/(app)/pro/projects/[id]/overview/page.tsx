import { MyProjects } from "@/lib/mock/projects";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return MyProjects.map(p => ({ id: p.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
