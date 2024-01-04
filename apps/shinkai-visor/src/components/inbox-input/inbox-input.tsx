import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormField,
  FormItem,
  PromptTextarea,
} from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import { SendHorizonal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { z } from 'zod';

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
  const { message } = form.watch();
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
        className="flex flex-row justify-between space-x-2"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="flex grow flex-col space-y-2">
          <FormField
            control={form.control}
            disabled={props.disabled || props.loading}
            name="message"
            render={({ field }) => (
              <motion.div
                animate={{ width: message?.length ? '99%' : '100%' }}
                initial={{ width: '100%' }}
                transition={{ type: 'tween' }}
              >
                <FormItem>
                  <PromptTextarea
                    autoFocus
                    field={field}
                    isLoading={props.loading}
                    label={intl.formatMessage({ id: 'tmwtd' })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        form.handleSubmit(submit)();
                      }
                    }}
                    value={field.value}
                  />
                </FormItem>
              </motion.div>
            )}
          />
        </div>
        {!!message?.length && (
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              className="h-[60px] w-[60px] grow-0 rounded-xl p-0"
              disabled={
                !form.formState.isValid || props.disabled || props.loading
              }
            >
              <SendHorizonal className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </form>
    </Form>
  );
};
