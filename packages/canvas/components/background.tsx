export const CanvasBackground = () => (
  <svg
    aria-label="Canvas background"
    className="pointer-events-none absolute h-full w-full select-none"
    data-testid="rf__background"
  >
    <pattern
      height="20"
      id="pattern"
      patternTransform="translate(-0.5,-0.5)"
      patternUnits="userSpaceOnUse"
      width="20"
      x="10"
      y="14"
    >
      <circle className="fill-muted-foreground" cx="0.5" cy="0.5" r="0.5" />
    </pattern>
    <rect fill="url(#pattern)" height="100%" width="100%" x="0" y="0" />
  </svg>
);
