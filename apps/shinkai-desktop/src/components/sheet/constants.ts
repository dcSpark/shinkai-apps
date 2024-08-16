import { ColumnType } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { FilesIcon, FormulaIcon } from '@shinkai_network/shinkai-ui/assets';
import { FileUpIcon, HashIcon, SparklesIcon, TextIcon } from 'lucide-react';

export const fieldTypes = [
  {
    id: ColumnType.Text,
    label: 'Text',
    icon: TextIcon,
  },
  {
    id: ColumnType.Number,
    label: 'Number',
    icon: HashIcon,
  },
  {
    id: ColumnType.Formula,
    label: 'Formula',
    icon: FormulaIcon,
  },
  {
    id: ColumnType.LLMCall,
    label: 'AI Generated',
    icon: SparklesIcon,
  },
  {
    id: ColumnType.MultipleVRFiles,
    label: 'AI Local Files',
    icon: FilesIcon,
  },
  {
    id: ColumnType.UploadedFiles,
    label: 'Upload Files',
    icon: FileUpIcon,
  },
];
