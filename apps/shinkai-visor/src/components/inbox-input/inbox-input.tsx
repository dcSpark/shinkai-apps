import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  DotsLoader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
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
  className: string,
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
        className={cn("flex flex-row justify-between space-x-2  p-1", props.className || '')}
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="flex grow flex-col space-y-2 ">
          <FormField
            control={form.control}
            disabled={props.disabled || props.loading}
            name="message"
            render={({ field }) => (
              <motion.div
                animate={{ width: message?.length ? '99%' : '100%' }}
                initial={{ width: '100%' }}
                transition={{
                  type: 'tween',
                }}
              >
                <FormItem>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  {props.loading ? (
                    <DotsLoader className="absolute left-4 top-6" />
                  ) : (
                    <FormLabel>
                      {intl.formatMessage({
                        id: 'tmwtd',
                      })}
                    </FormLabel>
                  )}
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
