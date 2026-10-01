/** An image ready to render: already localized and optimizable by next/image. */
export type ImageAsset = {
  src: string;
  alt: string;
  /** CSS object-position for tight crops, e.g. "50% 30%". Defaults to centre. */
  focalPoint?: string;
};
