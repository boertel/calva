import * as React from "react";

export function HideIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" {...props}>
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
        d="M201.15 127.305l22.81 39.508M154.182 149.263l7.114 40.344M101.73 149.244l-7.115 40.35M54.809 127.272l-22.92 39.699M32 104.875C48.811 125.685 79.633 152 128 152s79.188-26.314 96-47.125"
      />
    </svg>
  );
}

export function ShowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" {...props}>
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        d="M128 55.992C48 55.992 16 128 16 128s32 71.992 112 71.992S240 128 240 128s-32-72.008-112-72.008z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
      <circle
        cx={128}
        cy={128.001}
        r={40}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
    </svg>
  );
}
