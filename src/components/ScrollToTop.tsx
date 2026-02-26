/**
 * ScrollToTop - Scroll to top on route change
 * Add this inside BrowserRouter to automatically scroll to top
 * when navigating to a new page
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
