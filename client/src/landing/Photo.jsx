import { useCallback, useRef, useState } from 'react'
import { PHOTO_META } from '../content/photoMeta'
import { PHOTOS } from '../content/photos'
import { useParallax } from './hooks'

/**
 * Responsive photograph: WebP `srcset`, intrinsic size (no layout shift), blurred placeholder,
 * lazy loading unless `priority`. Extra props (data-reveal, style…) go on the frame.
 */
export const Photo = ({ name, alt, sizes = '100vw', priority = false, className = '', position, style, ...rest }) => {
  const [loaded, setLoaded] = useState(false)
  const meta = PHOTO_META[name]
  const photo = PHOTOS[name]
  const markLoaded = useCallback((img) => {
    if (img?.complete && img.naturalWidth) setLoaded(true)
  }, [])

  if (!meta || !photo) return null
  const fallback = meta.widths[Math.min(1, meta.widths.length - 1)]
  const height = Math.round(fallback / meta.ratio)

  return (
    <div
      className={`photo${loaded ? ' is-loaded' : ''} ${className}`.trim()}
      style={{ backgroundImage: `url("${meta.blur}")`, ...style }}
      {...rest}
    >
      <img
        ref={markLoaded}
        src={`/photos/${name}-${fallback}.webp`}
        srcSet={meta.widths.map((w) => `/photos/${name}-${w}.webp ${w}w`).join(', ')}
        sizes={sizes}
        alt={alt}
        width={fallback}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable="false"
        style={{ objectPosition: position || photo.position }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

/**
 * Photograph in a fixed frame: the frame opens with a mask on reveal, the picture drifts slightly inside it
 * on scroll. The frame's proportions come from CSS (`className`).
 */
export const FramedPhoto = ({ name, alt, sizes, priority, className = '', parallax = 40, delay = 0, position }) => {
  const driftRef = useRef(null)
  useParallax(driftRef, parallax)
  return (
    <div className={`framed ${className}`.trim()} data-reveal="mask" style={{ '--d': delay }}>
      <div className="framed-drift" ref={driftRef}>
        <Photo name={name} alt={alt} sizes={sizes} priority={priority} position={position} />
      </div>
    </div>
  )
}

export default Photo
