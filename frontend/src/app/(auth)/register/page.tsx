import { Suspense } from 'react';
import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-screen max-w-md px-6 py-24 text-earth-800/80">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
