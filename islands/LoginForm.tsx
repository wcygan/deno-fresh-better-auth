import { useState } from "preact/hooks";
import { authClient } from "../utils/auth-client.ts";

function Spinner() {
  return (
    <span
      class="inline-block align-[-2px] animate-spin rounded-full border-2 border-white/30 border-t-white size-4"
      aria-hidden="true"
    />
  );
}

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (loading) return; // prevent double submit
    setError(null);
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name });

      if (result.error) {
        setError(result.error.message ?? "Something went wrong");
      } else {
        globalThis.location.href = "/";
      }
    } catch (_err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onToggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
  };

  const onGitHubSignIn = async () => {
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (_err) {
      setError("GitHub sign-in failed. Please try again.");
    }
  };

  const disabled = loading;

  return (
    <div class="max-w-sm mx-auto">
      <form onSubmit={onSubmit} class="flex flex-col gap-2" aria-busy={loading}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            class="border p-2 rounded"
            required
            disabled={disabled}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          class="border p-2 rounded"
          required
          disabled={disabled}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          class="border p-2 rounded"
          required
          disabled={disabled}
        />

        {error && (
          <p class="text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <button
          type="submit"
          class="bg-blue-600 text-white p-2 rounded disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={disabled}
        >
          {loading && <Spinner />}
          <span>
            {loading
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "Login" : "Sign Up"}
          </span>
        </button>
      </form>

      <div class="mt-4">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGitHubSignIn}
          class="w-full mt-4 bg-gray-900 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>

      <p class="mt-4 text-sm text-center">
        {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={onToggleMode}
          class="text-blue-600 underline disabled:opacity-60"
          disabled={disabled}
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </button>
      </p>

      {/* Optional live region for status updates */}
      <p class="sr-only" aria-live="polite">
        {loading
          ? mode === "login"
            ? "Signing in"
            : "Creating account"
          : ""}
      </p>
    </div>
  );
}
