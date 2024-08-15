import { zodResolver } from '@hookform/resolvers/zod';
import { JSShinkaiTool } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import {
  Form,
  FormField,
  Separator,
  Switch,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { formatWorkflowName } from '../../pages/create-job';
import { SubpageLayout } from '../../pages/layout/simple-layout';
// import { useAuth } from '../../store/auth';

const jsToolSchema = z.object({
  apiKey: z.string().optional(),
  description: z.string().optional(),
});
type JsToolFormSchema = z.infer<typeof jsToolSchema>;

export default function JsTool({
  tool,
  isEnabled,
}: {
  tool: JSShinkaiTool;
  isEnabled: boolean;
}) {
  const params = useParams();
  // const auth = useAuth((state) => state.auth);
  const form = useForm<JsToolFormSchema>({
    resolver: zodResolver(jsToolSchema),
  });
  console.log(params);
  return (
    <SubpageLayout alignLeft title={formatWorkflowName(tool.name)}>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch checked={isEnabled} />
        </div>
        {[
          {
            label: 'Description',
            value: tool.description,
          },
          {
            label: 'Author',
            value: tool.author,
          },
          {
            label: 'Keyword',
            value: tool.keywords,
          },
        ].map(({ label, value }) => (
          <div className="flex flex-col gap-1 py-4" key={label}>
            <span className="text-gray-80 text-xs">{label}</span>
            <span className="text-sm text-white">{value}</span>
            {/*<Textarea*/}
            {/*  className="!min-h-[100px] resize-none pl-2 pt-2 text-sm placeholder-transparent"*/}
            {/*  placeholder={'Enter prompt or a formula...'}*/}
            {/*  readOnly*/}
            {/*  spellCheck={false}*/}
            {/*  value={value ?? ' '}*/}
            {/*/>*/}
          </div>
        ))}
        <Separator orientation="horizontal" />
        <div className="mb-4 pt-6 text-xs font-medium">Tool Configuration</div>
        <Form {...form}>
          <form className="flex flex-col justify-between space-y-8">
            <div className="flex grow flex-col space-y-5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <TextField
                    classes={{
                      input: 'font-mono',
                    }}
                    field={{ ...field }}
                    label={'Enter Description'}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <TextField
                    classes={{
                      input: 'font-mono',
                    }}
                    field={{ ...field }}
                    label={'Enter API KEY'}
                  />
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </SubpageLayout>
  );
}
