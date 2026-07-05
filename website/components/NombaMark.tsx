/**
 * Nomba brand mark, used for co-branding ("connects to Nomba"). Rendered in
 * `currentColor` so callers set the tone. viewBox is padded to a square so the
 * (taller-than-wide) mark stays centred and undistorted at any size.
 */
export function NombaMark({ size, className = "" }: { size?: number; className?: string }) {
  const dim = size ?? "1em";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2.9 0 41 41"
      width={dim}
      height={dim}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.2,16.5l3.5-2.1l3.5-2.1l3.5-2.1l3.5-2.1V0l-3.5,2.1l-3.5,2.1l-3.5,2.1l-3.5,2.1l-3.5,2.1v4l-3.5-2.1l-3.5-2.1L7,8.3L3.5,6.2L0,4v8.1l3.5,2.1L7,16.4l3.5,2.1l3.5,2.1l3.5,2.1L14,24.8l-3.5,2.1L7,29l-3.5,2.1L0,32.9V41l3.5-2.1L7,36.8l3.5-2.1l3.5-2.1l3.5-2.1v-4l3.5,2.1l3.5,2.1l3.5,2.1l3.5,2.1L35,37v-8.1l-3.5-2.1L28,24.6l-3.5-2.1L21,20.4l-3.5-2.1L21.2,16.5z" />
    </svg>
  );
}
