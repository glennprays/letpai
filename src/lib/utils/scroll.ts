/**
 * Scroll utility functions for better UX
 */

let scrollTimeout: NodeJS.Timeout | null = null;

export function checkScrollDirection(element: HTMLElement) {
  // Debounce scroll events for performance
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  scrollTimeout = setTimeout(() => {
    // Can be used for scroll-based UI updates
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Check if near bottom (for infinite scroll)
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (nearBottom) {
      element.dispatchEvent(new CustomEvent('nearbottom'));
    }
  }, 100);
}

export function scrollToTop(element: HTMLElement, smooth = true) {
  element.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

export function scrollToBottom(element: HTMLElement, smooth = true) {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  });
}
