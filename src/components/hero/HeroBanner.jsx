import Link from 'next/link';
import './HeroBanner.css';

const HeroBanner = ({
  title,
  seoTitle,
  subtitle,
  image,
  imageMobile,
  imageDesktop,
  imagePosition,
  imagePositionDesktop,
  ctaLabel,
  ctaHref
}) => {
  const usePicture = Boolean(imageMobile && imageDesktop);
  const heroStyle = {
    ...(imagePosition ? { '--hero-banner-position': imagePosition } : {}),
    ...(imagePositionDesktop ? { '--hero-banner-position-desktop': imagePositionDesktop } : {}),
    ...(!usePicture && image ? { '--hero-banner-image': `url(${image})` } : {})
  };
  const showCta = Boolean(ctaLabel && ctaHref);

  return (
    <section className="hero-banner" style={heroStyle}>
      {usePicture ? (
        <picture className="hero-banner__media">
          <source media="(max-width: 768px)" srcSet={imageMobile} />
          <img src={imageDesktop} alt="" className="hero-banner__image" decoding="async" />
        </picture>
      ) : null}
      <div className="hero-banner__overlay">
        <div className="hero-banner__copy">
          <h1>
            {seoTitle ? <span className="hero-banner__seo-title">{seoTitle}</span> : null}
            <span aria-hidden={seoTitle ? 'true' : undefined}>{title}</span>
          </h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {showCta ? (
          <div className="hero-banner__cta">
            <Link className="cta-button" href={ctaHref}>
              <span>{ctaLabel}</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HeroBanner;
