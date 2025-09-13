import { useState } from "preact/hooks";
import { authClient } from "../utils/auth-client.ts";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message ?? null);
    } else {
      globalThis.location.href = "/";
    }
  };

  return (
    <form onSubmit={onSubmit} class="flex flex-col gap-2 max-w-sm mx-auto">
      {/* ... */}
    </form>
  );
}
