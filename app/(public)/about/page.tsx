import { Music, Users, ShieldCheck, Sparkles } from "lucide-react";

const values = [
  {
    icon: Music,
    title: "Music First",
    description:
      "We build tools that help musicians spend less time searching and more time performing.",
  },
  {
    icon: Users,
    title: "Better Connections",
    description:
      "Organizers and artists connect directly, with clear expectations and faster communication.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description:
      "We emphasize verified profiles and transparent gig information to reduce hiring risk.",
  },
  {
    icon: Sparkles,
    title: "Practical Simplicity",
    description:
      "A clean experience for finding gigs, managing applications, and growing your reputation.",
  },
];

export default function Page() {
  return (
    <div className="space-y-10 pb-8">
      <section className="rounded-3xl border border-border/60 bg-card p-8 md:p-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
          About Get-a-Gig
        </p>
        <h1 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
          A focused platform for musicians and organizers
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
          Get-a-Gig helps musicians discover quality opportunities and helps
          organizers find reliable talent quickly. We designed the platform to
          keep hiring simple, communication clear, and outcomes professional.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {values.map((value) => (
          <article
            key={value.title}
            className="rounded-2xl border border-border/60 bg-card p-6"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <value.icon size={20} />
            </div>
            <h2 className="mb-2 text-xl font-bold">{value.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {value.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
