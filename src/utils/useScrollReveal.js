import { useEffect } from 'react';

export const useScrollReveal = (options) => {
  useEffect(() => {
    const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';
    if (typeof window === 'undefined' || isReactSnap) return undefined;

    const scopes = Array.from(document.querySelectorAll('.reveal-scope'));
    scopes.forEach((scope) => scope.setAttribute('data-reveal-ready', 'true'));

    const {
      root = null,
      rootMargin = '0px 0px -15% 0px',
      threshold = 0.08,
      staggerDelay = 120,
      fallbackDelay = 2500
    } = options || {};

    const targets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!targets.length) return undefined;

    const revealImmediately = () => {
      targets.forEach((element) => {
        element.classList.add('is-visible');
      });
    };

    if (typeof IntersectionObserver === 'undefined') {
      revealImmediately();
      return undefined;
    }

    const setDelay = (element) => {
      if (!element) return;
      if (element.dataset.revealDelay) {
        element.style.setProperty('--reveal-delay', element.dataset.revealDelay);
        return;
      }
      const order = Number(element.dataset.revealOrder);
      if (!Number.isNaN(order)) {
        element.style.setProperty('--reveal-delay', `${order * staggerDelay}ms`);
      }
    };

    targets.forEach(setDelay);

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    targets.forEach((element) => {
      observer.observe(element);
    });

    const mutationObserver = new MutationObserver(() => {
      Array.from(document.querySelectorAll('[data-reveal]:not(.is-visible)')).forEach((element) => {
        setDelay(element);
        observer.observe(element);
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const fallbackTimer = window.setTimeout(revealImmediately, fallbackDelay);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [options]);
};
