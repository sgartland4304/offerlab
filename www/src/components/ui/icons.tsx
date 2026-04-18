/**
 * Icon components sourced from www/assets/icons/.
 * All use currentColor so they inherit text color from the parent.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

export function IconArrowRight({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m14 6 6 6-6 6m5-6H4"
      />
    </svg>
  );
}

export function IconLinkChain({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m10 5.5.751-.742a6.003 6.003 0 0 1 8.49 8.49L18.5 14m-13-4-.742.751a6.003 6.003 0 0 0 8.49 8.49L14 18.5M10 14l4-4"
      />
    </svg>
  );
}
