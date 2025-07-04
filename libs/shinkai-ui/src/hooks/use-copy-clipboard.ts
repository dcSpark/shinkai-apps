import { useState } from 'react';
import { copyToClipboard } from '../helpers';

type UseCopyClipboardProps = {
  string?: string;
  onCopyClipboard?: () => void;
};

export const useCopyClipboard = ({
  string,
  onCopyClipboard,
}: UseCopyClipboardProps) => {
  const [isCopied, setIsCopied] = useState(false);

  let timeout: ReturnType<typeof setTimeout>;
  const onCopy = async () => {
    if (!string) return;
    const string_ = string.trim();
    if (onCopyClipboard && typeof onCopyClipboard === 'function') {
      onCopyClipboard();
    } else {
      await copyToClipboard(string_);
    }
    setIsCopied(true);
    clearTimeout(timeout);
    timeout = setTimeout(() => setIsCopied(false), 1000);
  };

  return { isCopied, onCopy };
};
