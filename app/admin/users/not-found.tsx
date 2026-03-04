import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-foreground">User Not Found</h2>
      <p className="text-foreground/60">
        Could not find the requested user resource.
      </p>
      <Link
        href="/admin/users"
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        Return to Users
      </Link>
    </div>
  );
}
