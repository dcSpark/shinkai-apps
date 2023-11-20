import type { IProps } from "react-qrcode-logo";

import React from "react";
import { QRCode as ReactQRCode } from "react-qrcode-logo";

import shinkaiLogo from "../../../app-icon.png";

export default function QRCode({
  value,
  size,
  id,
}: {
  value: IProps["value"];
  size: IProps["size"];
  id?: IProps["id"];
}): React.ReactElement {
  return (
    <ReactQRCode
      eyeColor="black"
      eyeRadius={10}
      fgColor="black"
      id={id}
      logoHeight={40}
      logoImage={shinkaiLogo}
      logoPaddingStyle="circle"
      logoWidth={size ? size * 0.2 : undefined}
      qrStyle="dots"
      size={size ?? 300}
      value={value}
      removeQrCodeBehindLogo
    />
  );
}
