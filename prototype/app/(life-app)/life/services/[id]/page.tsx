import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
