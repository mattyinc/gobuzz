/**
 * Animated ECG stroke echoing the pulse in the Go'Buzz logotype.
 * Decorative — hidden from assistive tech.
 */
export function PulseLine({
  className = "",
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 900 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        className={animate ? "pulse-draw" : undefined}
        d="M0 100 H480 C520 100 540 92 556 84 L576 122 L604 18 L634 168 L662 62 L682 112 C700 101 716 100 736 100 H900"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
