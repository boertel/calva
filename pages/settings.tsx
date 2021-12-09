import { signOut } from "next-auth/react";
import UserMenu from "components/UserMenu";
import { useUser } from "@/hooks";

export default function Settings() {
  const user = useUser();
  return (
    <>
      <main className="flex flex-col max-w-prose w-full mx-auto space-y-8 mt-6">
        <h1 className="text-5xl font-black">Settings</h1>
        <section>
          <h3 className="font-bold text-md">
            Connected with: <small className="font-normal text-base">{user?.email}</small>
          </h3>
        </section>
        <section>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-md border border-white bg-white bg-opacity-0 hover:bg-opacity-20"
          >
            Log out
          </button>
        </section>
      </main>
      <UserMenu href="/" />
    </>
  );
}
