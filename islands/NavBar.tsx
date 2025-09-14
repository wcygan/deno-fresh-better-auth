// islands/NavBar.tsx
import { useStore } from "@nanostores/preact";
import { authClient } from "../utils/auth-client.ts";

export default function NavBar() {
  // subscribe to the Atom
  const session = useStore(authClient.useSession);

  const onSignOut = async () => {
    await authClient.signOut();
    globalThis.location.href = "/";
  };

  const user = session?.data?.user;

  return (
    <nav class="w-full border-b bg-white">
      <div class="mx-auto max-w-screen-xl px-4 py-3 flex items-center justify-between">
        <a href="/" class="font-semibold">deno-fresh-better-auth</a>
        <div class="flex items-center gap-3">
          {user ? (
            <>
              <span class="text-sm text-gray-600">{user.email}</span>
              <button class="rounded px-3 py-1 bg-gray-900 text-white" onClick={onSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <a class="rounded px-3 py-1 bg-blue-600 text-white" href="/login">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}
