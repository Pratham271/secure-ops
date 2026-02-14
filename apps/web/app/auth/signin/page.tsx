import { signIn } from '@/lib/auth';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SecureOps
          </h1>
          <p className="text-gray-600">
            Sign in to connect your GitHub account and start automating incident
            response
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            await signIn('github', { redirectTo: '/settings' });
          }}
          className="space-y-4"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            Continue with GitHub
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">
              Permissions we'll request:
            </p>
            <ul className="text-xs text-gray-600 space-y-1 ml-4">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Read your profile</strong> - To identify you
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Repository access</strong> - To create and update
                  issues in your selected repository
                </span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 italic mt-2">
              You'll choose which repository to use in the next step. We only
              create tickets in your selected repository.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
