import { useUser } from "@/hooks";

export default function UserMenu() {
  const user = useUser();
  return (
    <div className="fixed bottom-0 left-0 mb-6 ml-8 hidden md:block">
      <img
        className="rounded-full w-12 h-12 hover:ring-2 hover:ring-purple-500 border-4 border-transparent cursor-pointer z-[-1]"
        src={user.image}
        alt={`${user.name} profile picture`}
      />
    </div>
  );
}
