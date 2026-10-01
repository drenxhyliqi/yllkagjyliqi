/** An image ready to render: already localized and optimizable by next/image. */
export type ImageAsset = {
  src: string;
  alt: string;
  /** CSS object-position for tight crops, e.g. "50% 30%". Defaults to centre. */
  focalPoint?: string;
  /** Intrinsic size, when known; lets galleries keep each photo's shape. */
  width?: number;
  height?: number;
};
