import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from '@shinkai_network/shinkai-ui';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { z } from 'zod';

import DotsLoader from '../ui/dots-loader';

const formSchema = z.object({
  message: z.string().min(1),
});

type InboxInputFieldType = z.infer<typeof formSchema>;

type InboxInputProps = {
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

export const InboxInput = (props: InboxInputProps) => {
  const form = useForm<InboxInputFieldType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });
  const intl = useIntl();
  const submit = (values: InboxInputFieldType) => {
    const value = values?.message?.trim();
    if (value) {
      props.onSubmit(value);
      form.reset({ message: '' });
      // TODO: Improve this. Workaround to set focus after submit form
      setTimeout(() => {
        form.setFocus('message');
      }, 200);
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-row justify-between space-x-2 p-1"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="flex grow flex-col space-y-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={intl.formatMessage({
                      id: 'tmwtd',
                    })}
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="grow-0"
          disabled={!form.formState.isValid || props.disabled || props.loading}
        >
          {props.loading ? (
            <DotsLoader className="h-4 w-6"></DotsLoader>
          ) : (
            <Send className="h-4 w-6" />
          )}
        </Button>
      </form>
    </Form>
  );
};
