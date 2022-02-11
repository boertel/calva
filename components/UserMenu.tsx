import { useUser } from "@/hooks";
import Image from "next/image";
import Link from "next/link";

export default function UserMenu({ href }: { href: string }) {
  const user = useUser();
  return (
    <div className="fixed bottom-0 left-0 mb-6 ml-8 hidden md:block z-20">
      {!!user?.image && (
        <Link href={href}>
          <a className="flex w-12 h-12 hover:ring-2 rounded-full hover:ring-purple-500 border-4 border-transparent cursor-pointer z-[-1]">
            <Image
              className="rounded-full"
              width={48}
              height={48}
              src={user.image}
              alt={`${user.name} profile picture`}
            />
          </a>
        </Link>
      )}
    </div>
  );
}
