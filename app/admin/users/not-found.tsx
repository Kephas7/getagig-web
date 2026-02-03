import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        User Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        Could not find the requested user resource.
      </p>
      <Link
        href="/admin/users"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Return to Users
      </Link>
    </div>
  );
}
