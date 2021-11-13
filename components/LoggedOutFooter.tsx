import cn from "classnames";
import { LoginButton } from "@/ui";

export default function LoggedOutFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "sticky bottom-0 z-20 mx-auto max-w-prose flex flex-col items-center justify-center p-8 space-y-8 pb-16 transition-opacity duration-700",
        className
      )}
    >
      <h1 className="text-9xl font-black text-center">calva</h1>
      <h2 className="text-4xl font-bold text-center pb-10">
        a calendar for the rest of us
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <li className="flex justify-center items-center text-center border-4 p-6 border-purple-500 border-opacity-30 transition-colors hover:border-opacity-100 rounded-xl bg-black bg-opacity-80">
          <h3 className="">Forget the past, focus on the present</h3>
        </li>
        <li className="flex justify-center items-center text-center border-4 p-6 border-purple-500 border-opacity-30 transition-colors hover:border-opacity-100 rounded-xl bg-black bg-opacity-80">
          <h3 className="">One click to join</h3>
        </li>
        <li className="flex justify-center items-center text-center border-4 p-6 border-purple-500 border-opacity-30 transition-colors hover:border-opacity-100 rounded-xl bg-black bg-opacity-80">
          <h3 className="">Quick overview of what is coming next</h3>
        </li>
      </ul>
      <LoginButton />
    </footer>
  );
}
