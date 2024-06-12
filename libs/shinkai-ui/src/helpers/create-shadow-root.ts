import { createRoot } from 'react-dom/client';

/**
 * Creates a shadow root with the specified styles and returns a React root in it.
 * @param {string} tagName - Node name to be applied to the shadow root.
 * @param {string} styles - CSS styles to be applied to the shadow root.
 * @returns {ReactRoot} - React root rendered inside the shadow root.
 */

export function createShadowRoot(tagName: string, styles: string) {
  const container = document.createElement(tagName);
  const shadow = container.attachShadow({ mode: 'open' });

  // Create a new CSS style sheet and apply the specified styles and apply the style sheet to the shadow root
  const globalStyleSheet = new CSSStyleSheet();
  globalStyleSheet.replaceSync(styles);
  shadow.adoptedStyleSheets = [globalStyleSheet];

  const html = document.querySelector('html') as HTMLHtmlElement;
  html.prepend(container);
  return createRoot(shadow);
}
