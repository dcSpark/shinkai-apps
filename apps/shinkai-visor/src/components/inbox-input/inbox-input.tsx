import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { z } from 'zod';

import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  message: z.string().nonempty(),
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
    }
  };
  return (
    <Form {...form}>
      <form
        className="p-1 flex flex-row space-x-2 justify-between"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="grow flex flex-col space-y-2">
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="grow-0"
          disabled={!form.formState.isValid || props.disabled}
        >
          {props.loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Form>
  );
};
