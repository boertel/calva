import * as React from "react";

export function ExternalIcon({ size = "1em", ...props }: { size: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 13a1 1 0 100-2 1 1 0 000 2z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray="3 6"
      />
    </svg>
  );
}
