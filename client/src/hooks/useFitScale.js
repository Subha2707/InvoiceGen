import { useState, useRef, useLayoutEffect } from 'react';

// A4 sheet proportions
const BASE_WIDTH = 794;
const BASE_HEIGHT = 1123;

const useFitScale = (baseWidth = BASE_WIDTH, deps = []) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.6);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth || el.getBoundingClientRect().width || 0;
      if (w <= 0) return;
      let s = w / baseWidth;
      // Only constrain by height when the container has a viewport-capped
      // max-height (small screens). On desktop there's no cap, so the sheet
      // fills the width and grows with the container.
      const maxH = window.getComputedStyle(el).maxHeight;
      if (maxH && maxH !== 'none') {
        const h = el.clientHeight;
        if (h > 0) {
          const sheet = el.querySelector('[data-sheet]');
          const contentH = sheet && sheet.offsetHeight > 0 ? sheet.offsetHeight : BASE_HEIGHT;
          s = Math.min(s, h / contentH);
        }
      }
      setScale(s > 0.05 ? s : 0.05);
    };

    update();
    // Re-measure once after a frame so fonts/layout fully settle.
    const raf = requestAnimationFrame(update);
    const obs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (obs) {
      obs.observe(el);
      const sheet = el.querySelector('[data-sheet]');
      if (sheet) obs.observe(sheet);
    }
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      if (obs) obs.disconnect();
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseWidth, ...deps]);

  return { ref, scale };
};

export default useFitScale;