import * as React from "react"

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      {...props}
    >
      <path
        fill="#00832D"
        d="M144.822 105.322l24.957 28.527 33.562 21.445 5.838-49.792-5.838-48.669-34.205 18.839z"
      />
      <path
        d="M0 150.66v42.43c0 9.688 7.864 17.554 17.554 17.554h42.43l8.786-32.059-8.786-27.925-29.11-8.786L.001 150.66z"
        fill="#0066DA"
      />
      <path
        fill="#E94235"
        d="M59.984 0L0 59.984l30.876 8.765 29.108-8.765 8.626-27.545z"
      />
      <path fill="#2684FC" d="M0 150.68h59.984V59.982H.001z" />
      <path
        d="M241.659 25.398L203.34 56.834v98.46l38.477 31.558c5.76 4.512 14.186.4 14.186-6.922V32.18c0-7.403-8.627-11.495-14.345-6.781"
        fill="#00AC47"
      />
      <path
        d="M144.822 105.322v45.338H59.984v59.984h125.804c9.69 0 17.553-7.866 17.553-17.554v-37.796l-58.519-49.972z"
        fill="#00AC47"
      />
      <path
        d="M185.788 0H59.984v59.984h84.838v45.338l58.52-48.49V17.555c0-9.69-7.864-17.554-17.554-17.554"
        fill="#FFBA00"
      />
    </svg>
  )
}

export default SvgComponent
