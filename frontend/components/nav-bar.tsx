import { LogoutButton } from "@/components/logout-button";

export function NavBar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <span className="font-semibold">Personal Platform</span>
        <LogoutButton />
      </div>
    </header>
  );
}
