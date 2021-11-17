// @ts-nocheck
import { CSSProperties } from "react";
import cn from "classnames";
import { useRouter } from "next/router";
import { useClock } from "@/hooks";

export function NowLine({ style }: { style?: CSSProperties }) {
  const { query } = useRouter();
  const now = useClock();
  return (
    <>
      <div
        className={cn(
          "w-full flex items-center text-red-500 transition-opacity text-opacity-40 hover:text-opacity-100"
        )}
        style={style}
      >
        <div id="now" className="relative bg-red-500 bg-opacity-60 w-full h-[2px]" />
        <div className="pl-2">{now?.format(query.format === "24h" ? "HH:mm" : "hh:mma")}</div>
      </div>
      <style jsx>{`
        div:hover #now {
          opacity: 100;
        }
        #now::before {
          content: " ";
          position: absolute;
          top: -5px;
          left: -12px;
          border: 2px solid currentColor;
          width: 12px;
          background-color: #000;
          height: 12px;
          border-radius: 100%;
        }
      `}</style>
    </>
  );
}
