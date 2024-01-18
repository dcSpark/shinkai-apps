import { zodResolver } from '@hookform/resolvers/zod';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Button,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useForm } from 'react-hook-form';
// import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import logo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useOnboarding } from '../../store/onboarding/onboarding';
import { Header } from '../header/header';

const PasswordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, { message: 'Password is too short' });

const formSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'The passwords must match',
      });
    }
  });
type FormType = z.infer<typeof formSchema>;

export default function CredentialsEncryption() {
  const history = useHistory();
  const setHasCredentialsEncrypted = useOnboarding(
    (state) => state.setHasCredentialsEncrypted,
  );

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  const onSubmit = (data: FormType) => {
    console.log('data', data);
    setHasCredentialsEncrypted(true);
    history.replace('/nodes/connect/method/quick-start');
  };
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <div className="mb-5 grid place-content-center">
          <img
            alt="shinkai logo"
            className="animate-spin-slow h-10 w-20"
            data-cy="shinkai-logo"
            src={srcUrlResolver(logo)}
          />
        </div>
        <Header title={'Setup a password  🔑'} />
        <p className="mt-4 text-sm text-gray-100">
          This password will be used to encrypt the credentials of your Shinkai
          Visor.
        </p>
        <div
          className=" mt-6 rounded-lg bg-gray-200 px-4 py-3 text-gray-50"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <InfoCircledIcon className="text-brand shrink-0 " />
            <p className="text-sm">
              {' '}
              If you forget your master password, you will have to reinstall
              Shinkai and restore your your connection file.
            </p>
          </div>
        </div>
        {/*<TextField field={} label={}/>  */}
      </div>
      <div className="flex flex-col gap-4">
        <Form {...form}>
          <form
            className="flex h-full flex-col justify-between space-y-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex grow flex-col space-y-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={'Password'}
                    type={'password'}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={'Confirm password'}
                    type={'password'}
                  />
                )}
              />
            </div>
            <Button
              onClick={() => {
                setHasCredentialsEncrypted(false);
                history.replace('/nodes/connect/method/quick-start');
              }}
              variant="outline"
            >
              Skip
            </Button>
            <Button type="submit">Set up password</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
