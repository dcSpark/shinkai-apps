import { CheckCircle2, CopyIcon } from 'lucide-react';
import React, { useState } from 'react';

import { copyToClipboard } from '../helpers/copy-to-clipboard';
import { cn } from '../utils';
import { Button } from './button';

type CopyToClipboardIconProps = {
  string?: string;
  children?: React.ReactNode;
  className?: string;
  onCopyClipboard?: () => void;
};

const CopyToClipboardIcon = ({
  string,
  children,
  className,
  onCopyClipboard,
}: CopyToClipboardIconProps) => {
  const [clipboard, setClipboard] = useState(false);

  let timeout: ReturnType<typeof setTimeout>;
  const onCopy = async () => {
    if (!string) return;
    const string_ = string.trim();
    if (onCopyClipboard && typeof onCopyClipboard === 'function') {
      onCopyClipboard();
    } else {
      await copyToClipboard(string_);
    }
    setClipboard(true);
    clearTimeout(timeout);
    timeout = setTimeout(() => setClipboard(false), 1000);
  };

  const ClipboardIcon = clipboard ? CheckCircle2 : CopyIcon;

  return (
    <Button
      className={cn(
        'flex h-8 w-8 gap-2 rounded-lg bg-gray-400 text-xs font-normal text-gray-50 transition-colors hover:bg-gray-400 hover:text-white',
        className,
      )}
      disabled={!string}
      onClick={onCopy}
      size={'icon'}
      type="button"
      variant="ghost"
    >
      <ClipboardIcon
        className={cn('h-3.5 w-3.5', clipboard && 'text-green-600')}
      />
      {children}
    </Button>
  );
};

export { CopyToClipboardIcon };
