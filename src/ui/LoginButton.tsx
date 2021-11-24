import { signIn } from "next-auth/react";
import { GoogleLogo } from "@/icons";

export function LoginButton() {
  return (
    <>
      <button
        onClick={() => signIn("google")}
        className="bg-white relative flex text-black justify-center items-center px-6 py-2 rounded-md space-x-2 hover:bg-white w-full md:w-auto"
      >
        <GoogleLogo className="text-4xl" />
        <span>Login with Google</span>
      </button>
      <style jsx>{`
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.015);
          }
        }

        button:before {
          content: " ";
          position: absolute;
          inset: -20px;
          transform: scale(0.7);
          z-index: -1;

          box-shadow: inset 0 0 12px 12px black, inset 0 0 3px 2px black;
          background: rgb(205, 56, 47);
          background: linear-gradient(
            115deg,
            rgba(205, 56, 47, 1) 0%,
            rgba(229, 150, 51, 1) 42%,
            rgba(72, 154, 74, 1) 74%,
            rgba(63, 109, 232, 1) 89%
          );
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:hover:before {
          transform: scale(1);
        }
      `}</style>
    </>
  );
}
