import { useState } from "preact/hooks";
import { authClient } from "../utils/auth-client.ts";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const result =
      mode === "login"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong");
    } else {
      globalThis.location.href = "/";
    }
  };

  return (
    <div class="max-w-sm mx-auto">
      <form onSubmit={onSubmit} class="flex flex-col gap-2">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            class="border p-2 rounded"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          class="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          class="border p-2 rounded"
          required
        />
        {error && <p class="text-red-500">{error}</p>}
        <button type="submit" class="bg-blue-500 text-white p-2 rounded">
          {mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      <p class="mt-4 text-sm text-center">
        {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          class="text-blue-600 underline"
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
