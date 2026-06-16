import { MyCustomers } from "@/lib/mock/customers";
import { Suspense } from "react";
import ClientPage from "./client";

export function generateStaticParams() {
  return MyCustomers.map(c => ({ id: c.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <ClientPage params={params} />
    </Suspense>
  );
}
