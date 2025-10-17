// Accessibility utilities and helpers for TATU application

/**
 * Keyboard navigation utilities
 */
export class KeyboardNav {
  // Common keyboard keys
  static Keys = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End'
  }

  // Check if event is activation key (Enter or Space)
  static isActivationKey(event: React.KeyboardEvent): boolean {
    return event.key === this.Keys.ENTER || event.key === this.Keys.SPACE
  }

  // Handle button-like keyboard interaction
  static handleButtonKeyDown(
    event: React.KeyboardEvent,
    callback: () => void
  ): void {
    if (this.isActivationKey(event)) {
      event.preventDefault()
      callback()
    }
  }

  // Navigate through a list with arrow keys
  static handleListNavigation(
    event: React.KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onNavigate: (newIndex: number) => void
  ): void {
    let newIndex = currentIndex

    switch (event.key) {
      case this.Keys.ARROW_DOWN:
        event.preventDefault()
        newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0
        break
      case this.Keys.ARROW_UP:
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1
        break
      case this.Keys.HOME:
        event.preventDefault()
        newIndex = 0
        break
      case this.Keys.END:
        event.preventDefault()
        newIndex = itemCount - 1
        break
    }

    if (newIndex !== currentIndex) {
      onNavigate(newIndex)
    }
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  // Trap focus within a container (useful for modals)
  static trapFocus(
    container: HTMLElement,
    event: KeyboardEvent
  ): void {
    if (event.key !== KeyboardNav.Keys.TAB) return

    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  // Get all focusable elements within a container
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')

    return Array.from(container.querySelectorAll(selector))
  }

  // Save and restore focus
  static saveFocus(): HTMLElement | null {
    return document.activeElement as HTMLElement
  }

  static restoreFocus(element: HTMLElement | null): void {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }
}

/**
 * ARIA utilities
 */
export class AriaHelper {
  // Generate unique ID for ARIA relationships
  static generateId(prefix: string = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Announce to screen readers
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Create accessible dialog
  static setupDialog(dialog: HTMLElement): {
    titleId: string
    descId: string
    cleanup: () => void
  } {
    const titleId = this.generateId('dialog-title')
    const descId = this.generateId('dialog-desc')

    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.setAttribute('aria-labelledby', titleId)
    dialog.setAttribute('aria-describedby', descId)

    const previousFocus = FocusManager.saveFocus()

    // Focus first focusable element
    setTimeout(() => {
      const focusable = FocusManager.getFocusableElements(dialog)
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }, 0)

    return {
      titleId,
      descId,
      cleanup: () => {
        FocusManager.restoreFocus(previousFocus)
      }
    }
  }
}

/**
 * Color contrast utilities (WCAG AA compliance)
 */
export class ColorContrast {
  // Calculate relative luminance
  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Calculate contrast ratio
  static getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const lum1 = this.getLuminance(...rgb1)
    const lum2 = this.getLuminance(...rgb2)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  // Check WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
  static meetsWCAG_AA(
    rgb1: [number, number, number],
    rgb2: [number, number, number],
    isLargeText: boolean = false
  ): boolean {
    const ratio = this.getContrastRatio(rgb1, rgb2)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReader {
  // Check if screen reader is likely active
  static isLikelyActive(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Create visually hidden but screen reader accessible text
  static getVisuallyHiddenStyles(): React.CSSProperties {
    return {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    }
  }
}

/**
 * Touch target sizing utilities (WCAG 2.5.5)
 */
export class TouchTarget {
  // Minimum touch target size (44x44px for WCAG AAA)
  static readonly MIN_SIZE = 44

  // Check if element meets minimum touch target size
  static meetsMinimumSize(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return rect.width >= this.MIN_SIZE && rect.height >= this.MIN_SIZE
  }

  // Get recommended padding to meet minimum size
  static getRecommendedPadding(
    currentWidth: number,
    currentHeight: number
  ): { horizontal: number; vertical: number } {
    const horizontalPadding = Math.max(0, Math.ceil((this.MIN_SIZE - currentWidth) / 2))
    const verticalPadding = Math.max(0, Math.ceil((this.MIN_SIZE - currentHeight) / 2))

    return {
      horizontal: horizontalPadding,
      vertical: verticalPadding
    }
  }
}

/**
 * Skip links utility
 */
export class SkipLinks {
  static create(targetId: string, label: string = 'Skip to main content'): HTMLAnchorElement {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = label
    skipLink.className = 'skip-link'
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `

    skipLink.addEventListener('focus', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: auto;
        height: auto;
        overflow: visible;
        z-index: 10000;
        padding: 1rem;
        background: white;
        color: black;
        text-decoration: none;
        border: 2px solid black;
      `
    })

    skipLink.addEventListener('blur', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `
    })

    return skipLink
  }
}

// Export all utilities
export default {
  KeyboardNav,
  FocusManager,
  AriaHelper,
  ColorContrast,
  ScreenReader,
  TouchTarget,
  SkipLinks
}

