export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#111111]">
      <section className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-8 text-sm uppercase tracking-[0.35em] text-[#b89b5e]">
          22. srpna 2026
        </div>

        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-[#d7c6a1] bg-white shadow-sm">
          <span className="text-5xl">🌿</span>
        </div>

        <h1 className="mb-4 font-serif text-5xl leading-tight">
          Zuzana
          <span className="block text-3xl text-[#b89b5e]">&</span>
          František
        </h1>

        <p className="mb-8 max-w-sm text-base leading-7 text-[#555]">
          Děkujeme, že jste součástí našeho svatebního dne. Budeme moc rádi,
          když se s námi podělíte o své fotografie a videa.
        </p>

        <a
          href="/upload"
          className="rounded-full bg-[#111111] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition hover:bg-[#2f4050]"
        >
          📷 Nahrát fotografie
        </a>

        <p className="mt-8 text-sm text-[#8b8b8b]">
          Bez přihlášení. Jen vyberete fotky a odešlete.
        </p>
      </section>
    </main>
  );
}