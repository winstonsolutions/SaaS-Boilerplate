import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold">
    <svg
      className="mr-1 size-8 stroke-current stroke-2"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 300 300"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="none"
    >
      <g
        transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path d="M125 2800 c-40 0 -75 -35 -75 -75 l0 -275 c0 -40 35 -75 75 -75 40 0 75 35 75 75 l0 200 200 0 c40 0 75 35 75 75 0 40 -35 75 -75 75 l-275 0 z" />
        <path d="M1050 2800 c-40 0 -75 -35 -75 -75 0 -40 35 -75 75 -75 l600 0 c40 0 75 35 75 75 0 40 -35 75 -75 75 l-600 0 z" />
        <path d="M2300 2800 c-40 0 -75 -35 -75 -75 0 -40 35 -75 75 -75 l200 0 0 -200 c0 -40 35 -75 75 -75 40 0 75 35 75 75 l0 275 c0 40 -35 75 -75 75 l-275 0 z" />
        <path d="M125 1800 c-40 0 -75 -35 -75 -75 l0 -600 c0 -40 35 -75 75 -75 40 0 75 35 75 75 l0 600 c0 40 -35 75 -75 75 z" />
        <path d="M2575 1800 c-40 0 -75 -35 -75 -75 l0 -600 c0 -40 35 -75 75 -75 40 0 75 35 75 75 l0 600 c0 40 -35 75 -75 75 z" />
        <path d="M125 500 c-40 0 -75 -35 -75 -75 l0 -275 c0 -40 35 -75 75 -75 l275 0 c40 0 75 35 75 75 0 40 -35 75 -75 75 l-200 0 0 200 c0 40 -35 75 -75 75 z" />
        <path d="M1050 215 c-40 0 -75 -35 -75 -75 0 -40 35 -75 75 -75 l600 0 c40 0 75 35 75 75 0 40 -35 75 -75 75 l-600 0 z" />
        <path d="M2200 960 c-40 0 -75 -35 -75 -75 l0 -300 -300 0 c-40 0 -75 -35 -75 -75 0 -40 35 -75 75 -75 l300 0 0 -300 c0 -40 35 -75 75 -75 40 0 75 35 75 75 l0 300 300 0 c40 0 75 35 75 75 0 40 -35 75 -75 75 l-300 0 0 300 c0 40 -35 75 -75 75 z" />
      </g>
    </svg>
    {!props.isTextHidden && AppConfig.name}
  </div>
);
