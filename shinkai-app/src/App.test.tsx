import React from "react";
import { act } from 'react-dom/test-utils';
import { render } from "@testing-library/react";
import App from "./App";
import { sha512 } from "@noble/hashes/sha512";
import * as ed from "@noble/ed25519";
import { vi } from 'vitest'

// Enable synchronous methods
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const { Crypto } = require("@peculiar/webcrypto");
const crypto = new Crypto();
globalThis.crypto = crypto;

// Mock getUserMedia
Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(),
  },
  writable: true,
});

HTMLMediaElement.prototype.play = () => Promise.resolve();

test("renders without crashing", async () => {
  await act(async () => { // wrap the render function in act
    const { baseElement } = render(<App />);
    expect(baseElement).toBeDefined();
  });
});
