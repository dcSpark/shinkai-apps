import { zodResolver } from '@hookform/resolvers/zod';
import { Download, FileKey } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useAuth } from '../../store/auth/auth';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

export const ExportConnection = () => {
  const intl = useIntl();
  const formSchema = z
  .object({
    passphrase: z.string().min(8),
    confirmPassphrase: z.string().min(8),
  })
  .superRefine(({ passphrase, confirmPassphrase }, ctx) => {
    if (passphrase !== confirmPassphrase) {
      ctx.addIssue({
        code: 'custom',
        message: intl.formatMessage({ id: 'passphrases-dont-match'}),
        path: ['confirmPassphrase'],
      });
    }
  });
  type FormSchemaType = z.infer<typeof formSchema>;
  const auth = useAuth((state) => state.auth);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passphrase: '',
      confirmPassphrase: '',
    },
  });
  const qrCanvasContainerRef = useRef<HTMLDivElement>(null);
  const passphrase = form.watch('passphrase');
  const confirmPassphrase = form.watch('confirmPassphrase');
  const [encryptedSetupData, setEncryptedSetupData] = useState<string>('');
  useEffect(() => {
    setEncryptedSetupData('');
  }, [passphrase, confirmPassphrase, setEncryptedSetupData]);
  const exportConnection = (values: FormSchemaType): void => {
    // TODO: Convert to a common format
    const parsedSetupData = JSON.stringify(auth);
    const encryptedSetupData = parsedSetupData; // TODO: call shinkai-typescript
    setEncryptedSetupData(encryptedSetupData);
  };
  const qrPropsCanvas = {
    level: 'L',
    size: 150,
    imageSettings: {
      src: srcUrlResolver(shinkaiLogo),
      x: undefined,
      y: undefined,
      height: 24,
      width: 24,
      excavate: true,
      includeMargin: false,
    },
  };
  const downloadQR = (): void => {
    const canvas: HTMLCanvasElement | undefined = qrCanvasContainerRef?.current?.children[0] as HTMLCanvasElement;
    if (!qrCanvasContainerRef.current || !canvas) {
      return;
    }
    const imageRef = canvas.toDataURL('image/jpg');
    const dummyAnchor = document.createElement('a');
    dummyAnchor.href = imageRef;
    dummyAnchor.download = `shinkai-${auth?.registration_name}-backup.jpg`;
    document.body.appendChild(dummyAnchor);
    dummyAnchor.click();
    document.body.removeChild(dummyAnchor);
  };
  return (
    <div className="h-full flex flex-col space-y-3">
      <div className="flex flex-row space-x-1 items-center">
        <FileKey className="h-4 w-4" />
        <h1 className="font-semibold">
          <FormattedMessage id="export-connection"></FormattedMessage>
        </h1>
      </div>
      <div className="grow flex flex-col space-y-2">
        <Form {...form}>
          <form
            className="flex flex-col space-y-3 justify-between"
            onSubmit={form.handleSubmit(exportConnection)}
          >
            <div className="grow flex flex-col space-y-2">
              <FormField
                control={form.control}
                name="passphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="passphrase" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage id="confirm-passphrase" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full" type="submit">
              <FileKey className="mr-2 h-4 w-4" />
              <FormattedMessage id="generate-connection-file" />
            </Button>
          </form>
        </Form>

        {encryptedSetupData && (
          <div className=" grow flex flex-col items-center justify-center space-y-3">
            <span>
              <FormattedMessage id="download-connection-file-description" />
            </span>
            <div className="w-full flex flex-col space-y-2 justify-center items-center">
            <div ref={qrCanvasContainerRef}>
              <QRCodeCanvas
                {...qrPropsCanvas}
                value={encryptedSetupData}
              />
            </div>
              <Button className="w-[150px]" onClick={() => downloadQR()}>
                <Download className="mr-2 h-4 w-4" />
                <FormattedMessage id="download" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
