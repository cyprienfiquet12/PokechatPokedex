import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-4xl font-bold text-slate-100">404</h1>
      <p className="text-slate-400">Cette page n’existe pas.</p>
      <Link href="/" className="btn-primary">
        Retour à l’accueil
      </Link>
    </div>
  );
}
