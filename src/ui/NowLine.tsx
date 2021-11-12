import { CSSProperties } from "react";
import cn from "classnames";
import { useRouter } from "next/router";
import dayjs from "@/dayjs";

export function NowLine({ style }: { style?: CSSProperties }) {
  const { query } = useRouter();
  return (
    <>
      <div
        className={cn(
          "w-full flex items-center text-red-500 pr-4 transition-opacity text-opacity-40 hover:text-opacity-100"
        )}
        style={style}
      >
        <div
          id="now"
          className="relative bg-red-500 bg-opacity-60 w-full h-[2px]"
        />
        <div className="pl-2">
          {dayjs().format(query.format === "24h" ? "HH:mm" : "hh:mma")}
        </div>
      </div>
      <style jsx>{`
        div:hover #now {
          opacity: 100;
        }
        #now::before {
          content: " ";
          position: absolute;
          top: -5px;
          left: 0;
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
