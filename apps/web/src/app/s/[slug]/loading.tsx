export default function StorefrontLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 bg-earth-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-jade-600 border-t-transparent" aria-hidden />
      <p className="text-sm text-earth-800/80">Loading storefront…</p>
    </div>
  );
}
