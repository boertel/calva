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
          --tw-bg-opacity: 1;
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

/*
function Clock() {
  const [n, setN] = useState<number>(0);
  const height = 24;

  useInterval(() => {
    setN((prev) => (prev + 1) % 11);
  }, 1000);

  const marginTop = `-${height * n}px`;
  const transition = "margin-top .2s ease-in-out";
  return (
    <div className="flex overflow-hidden h-6">
      <div className="relative">
        <div>0</div>
        <div>1</div>
      </div>
      <div className="relative" style={{ transition, marginTop }}>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>0</div>
      </div>
    </div>
  );
}
*/
