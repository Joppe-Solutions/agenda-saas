export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Fish SaaS</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-900">MVP de agendamento pronto para multi-nicho</h1>
      <p className="mt-4 text-slate-600">
        Use a rota publica de merchant em <code>/slug-do-merchant</code> e o painel protegido em <code>/dashboard</code>.
      </p>
    </main>
  );
}
