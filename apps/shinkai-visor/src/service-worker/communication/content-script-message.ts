import { ContentScriptMessageType } from "./content-script-message-type";

export type ContentScriptMessage =
  { type: ContentScriptMessageType.TogglePopupVisibility, data?: boolean };
