'use client';

import React, { useEffect, useRef, useState } from 'react';

const LazySoundCloudEmbed = ({
  embedUrl,
  title,
  description,
  profileHref,
  trackHref
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '150px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="past-events-stream" ref={containerRef}>
      {shouldLoad ? (
        <>
          <iframe
            className="past-events-stream__player"
            title={title}
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            src={embedUrl}
          ></iframe>
          <div className="past-events-stream__links">
            {profileHref ? (
              <a
                href={profileHref}
                title="Phemelo Ramatlotlo on SoundCloud"
                target="_blank"
                rel="noopener noreferrer"
              >
                SoundCloud Profile
              </a>
            ) : null}
            {profileHref && trackHref ? <span>·</span> : null}
            {trackHref ? (
              <a
                href={trackHref}
                title={title}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Track
              </a>
            ) : null}
          </div>
        </>
      ) : (
        <div className="past-events-stream__placeholder">
          <div className="past-events-stream__meta">
            <p className="past-events-stream__title">{title}</p>
            {description ? (
              <p className="past-events-stream__description">{description}</p>
            ) : null}
          </div>
          <div className="past-events-stream__pulse" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

export default LazySoundCloudEmbed;
