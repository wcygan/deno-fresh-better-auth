// islands/NavBar.tsx
import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";
import { authClient } from "../utils/auth-client.ts";

export default function NavBar() {
  // subscribe to the Atom
  const session = useStore(authClient.useSession);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onSignOut = async () => {
    await authClient.signOut();
    globalThis.location.href = "/";
    setDropdownOpen(false);
  };

  const user = session?.data?.user;

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-7xl items-center px-4">
        {/* Left: brand */}
        <a href="/" class="font-semibold">deno-fresh-better-auth</a>

        {/* Center: desktop nav */}
        <nav class="mx-6 hidden gap-4 md:flex">
          <a href="/" class="text-muted-foreground hover:text-foreground">Home</a>
        </nav>

        {/* Right: actions */}
        <div class="ml-auto flex items-center gap-2">
          {user ? (
            <>
              {/* User menu trigger (Avatar + Dropdown Menu) */}
              <div class="relative dropdown-menu">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  class="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                >
                  <div class="avatar">
                    <span class="avatar-initials">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    class="absolute right-0 top-full mt-2 min-w-56 rounded-md border bg-white shadow-lg z-50"
                    role="menu"
                  >
                    <div class="p-2">
                      <div role="group">
                        <div role="heading" class="px-2 py-1 text-sm font-medium text-gray-500">
                          {user.name || "Account"}
                        </div>
                        <div class="px-2 py-1 text-xs text-gray-400">
                          {user.email}
                        </div>
                      </div>

                      <hr role="separator" class="my-2" />

                      <div role="menuitem" class="flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Profile
                      </div>

                      <div role="menuitem" class="flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Settings
                      </div>

                      <hr role="separator" class="my-2" />

                      <div
                        role="menuitem"
                        class="flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer text-red-600"
                        onClick={onSignOut}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        Sign out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <a href="/login" class="btn">Login</a>
          )}

          {/* Mobile hamburger */}
          <button
            class="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div class="md:hidden border-t bg-white">
          <nav class="flex flex-col space-y-1 p-4">
            <a href="/" class="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              Home
            </a>
            <a href="/docs" class="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              Docs
            </a>
            {!user && (
              <a href="/login" class="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                Login
              </a>
            )}
          </nav>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          class="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}
