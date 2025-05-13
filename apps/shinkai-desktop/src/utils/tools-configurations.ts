import { ToolConfigBase } from "@shinkai_network/shinkai-message-ts/api/tools/types";

export const getToolRequiresConfigurations = (configs: ToolConfigBase[]) => {
  return !configs
    .map((conf) => ({
      key_name: conf.BasicConfig.key_name,
      key_value: conf.BasicConfig.key_value ?? '',
      required: conf.BasicConfig.required,
    }))
    .every(
      (conf) => !conf.required || (conf.required && conf.key_value !== ''),
    );
};
