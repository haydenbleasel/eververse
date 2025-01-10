export const CanvasBackground = () => (
  <svg
    className="pointer-events-none absolute h-full w-full select-none"
    data-testid="rf__background"
    aria-label="Canvas background"
  >
    <pattern
      id="pattern"
      x="10"
      y="14"
      width="20"
      height="20"
      patternUnits="userSpaceOnUse"
      patternTransform="translate(-0.5,-0.5)"
    >
      <circle cx="0.5" cy="0.5" r="0.5" className="fill-muted-foreground" />
    </pattern>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
  </svg>
);
