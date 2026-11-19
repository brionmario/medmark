import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="py-24">
      <h1 className="font-serif text-[2rem] leading-tight tracking-tight">Not found</h1>
      <p className="text-soft mt-4">That page doesn’t exist. It may have moved since it was on Medium.</p>
      <Link
        className="decoration-accent hover:text-accent mt-7 inline-block underline decoration-1 underline-offset-4"
        href="/"
      >
        ← All posts
      </Link>
    </section>
  );
}
