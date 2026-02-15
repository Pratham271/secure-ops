'use client';

import { useRouter } from 'next/navigation';

export function ProcessRepoButton({ repoFullName }: { repoFullName: string }) {
  const router = useRouter();

  const handleProcess = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    router.push(`/processing?repo=${encodeURIComponent(repoFullName)}`);
  };

  return (
    <button
      onClick={handleProcess}
      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition flex items-center gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Process Incidents
    </button>
  );
}
