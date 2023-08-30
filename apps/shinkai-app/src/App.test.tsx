import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { Crypto } from '@peculiar/webcrypto';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';

import App from './App';

// Enable synchronous methods
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const crypto = new Crypto();
globalThis.crypto = crypto;

// Mock getUserMedia
Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(),
  },
  writable: true,
});

// Mock React Markdown library
vi.mock('@uiw/react-markdown-preview', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ content, ...otherProps }: any) => <p {...otherProps}>content</p>,
}));

HTMLMediaElement.prototype.play = () => Promise.resolve();

test('renders without crashing', async () => {
  await act(async () => {
    // wrap the render function in act
    const { baseElement } = render(<App />);
    expect(baseElement).toBeDefined();
  });
});
