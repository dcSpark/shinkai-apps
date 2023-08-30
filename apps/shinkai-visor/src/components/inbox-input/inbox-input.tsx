import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChatMessageFormSchema,
  chatMessageFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/chat-message';
import {
  Button,
  ChatInputArea,
  Form,
  FormField,
  FormItem,
} from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import { SendHorizonal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

type InboxInputProps = {
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

export const InboxInput = (props: InboxInputProps) => {
  const form = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
    },
  });
  const { message } = form.watch();
  const intl = useIntl();
  const submit = (values: ChatMessageFormSchema) => {
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
        className="relative flex gap-2"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="flex grow flex-col">
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
                  <ChatInputArea
                    disabled={props.loading || props.disabled}
                    isLoading={props.loading}
                    onChange={field.onChange}
                    onSubmit={form.handleSubmit(submit)}
                    placeholder={intl.formatMessage({ id: 'tmwtd' })}
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
              <span className="sr-only">Send Message</span>
            </Button>
          </motion.div>
        )}
      </form>
    </Form>
  );
};
