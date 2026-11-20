import {Image} from '@shopify/hydrogen';
import {useParallax} from 'react-scroll-parallax';

type Img = {url: string; altText?: string | null; width?: number | null; height?: number | null};

/**
 * Image that drifts inside its frame while scrolling (react-scroll-parallax).
 * The image is slightly taller than its frame so no gaps ever show.
 * Disabled automatically for prefers-reduced-motion (see <ParallaxProvider> in PageLayout).
 */
export function ParallaxImage({
  image,
  strength = 8,
  sizes,
  alt = '',
}: {
  image: Img;
  /** Max drift in percent of the image height; negative moves against the scroll. */
  strength?: number;
  sizes?: string;
  alt?: string;
}) {
  const {ref} = useParallax<HTMLDivElement>({translateY: [`${-strength}%`, `${strength}%`]});
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="parallax" style={{'--px': `${Math.abs(strength) + 2}%`} as React.CSSProperties}>
      <Image data={image} alt={alt} sizes={sizes} loading="lazy" />
    </div>
  );
}
