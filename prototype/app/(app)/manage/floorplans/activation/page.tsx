import { Suspense } from 'react';
import ClientPage from './client';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientPage />
    </Suspense>
  );
}
