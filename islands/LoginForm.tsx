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
