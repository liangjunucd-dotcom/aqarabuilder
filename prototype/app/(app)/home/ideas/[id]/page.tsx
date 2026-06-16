import { MyIdeabooks } from "@/lib/mock/ideabooks";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return MyIdeabooks.map(ib => ({ id: ib.id }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
