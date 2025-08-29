import Image from "react-bootstrap/Image";

export function RenderedImage({ src, alt, node, ...rest }) {
  return <Image src={src} alt={alt} {...rest} fluid />;
}
