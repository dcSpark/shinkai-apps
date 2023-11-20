import { useState } from "react";

import { CheckCircle2, CopyIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

type CopyToClipboardIconProps = {
  string?: string;
  children?: React.ReactNode;
  className?: string;
};

const CopyToClipboardIcon = ({
  string,
  children,
  className,
}: CopyToClipboardIconProps) => {
  const [clipboard, setClipboard] = useState(false);

  let timeout: ReturnType<typeof setTimeout>;
  const onCopy = () => {
    if (!string) return;
    const string_ = string.trim();
    navigator.clipboard.writeText(string_);
    setClipboard(true);
    clearTimeout(timeout);
    timeout = setTimeout(() => setClipboard(false), 1000);
  };

  const ClipboardIcon = clipboard ? CheckCircle2 : CopyIcon;

  return (
    <Button
      className={cn(
        "flex gap-2 px-2 text-xs font-normal text-muted-foreground",
        className
      )}
      disabled={!string}
      onClick={onCopy}
      variant="ghost"
    >
      <ClipboardIcon className={cn("h-4 w-4", clipboard && "text-green-600")} />
      {children}
    </Button>
  );
};

export default CopyToClipboardIcon;
