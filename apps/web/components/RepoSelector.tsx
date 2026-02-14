'use client';

import { useState, useEffect } from 'react';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  language: string | null;
}

interface RepoSelectorProps {
  selectedRepo: string | null;
}

export function RepoSelector({ selectedRepo: initialRepo }: RepoSelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(initialRepo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/github/repos');
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRepository = async (repoFullName: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/github/select-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository: repoFullName }),
      });

      if (!response.ok) throw new Error('Failed to save repository');

      setSelectedRepo(repoFullName);
      window.location.reload(); // Refresh to show updated state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">Loading repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No repositories found with issues enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Select the repository where incident tickets will be created:
      </p>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {repositories.map((repo) => (
          <button
            key={repo.id}
            onClick={() => handleSaveRepository(repo.fullName)}
            disabled={saving}
            className={`w-full text-left p-3 rounded-lg border transition ${
              selectedRepo === repo.fullName
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {repo.fullName}
                  </span>
                  {repo.private && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      Private
                    </span>
                  )}
                  {selectedRepo === repo.fullName && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Selected
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {repo.description}
                  </p>
                )}
                {repo.language && (
                  <p className="text-xs text-gray-500 mt-1">{repo.language}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedRepo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Incident tickets will be created in{' '}
            <strong>{selectedRepo}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
