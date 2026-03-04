import Header from "./_components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </section>
  );
}
