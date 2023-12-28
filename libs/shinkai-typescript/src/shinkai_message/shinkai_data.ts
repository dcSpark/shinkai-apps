import { MessageSchemaType } from '../schemas/schema_types';

export interface ShinkaiData {
  message_raw_content: string;
  message_content_schema: MessageSchemaType;
}
