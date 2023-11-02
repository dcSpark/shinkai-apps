import { zodResolver } from '@hookform/resolvers/zod';
import { BrowserQRCodeReader } from '@zxing/browser';
import { FileKey, Loader2, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { SetupData, useAuth } from '../../store/auth/auth';
import { Button } from '../ui/button';
import ErrorMessage from '../ui/error-message';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  encryptedConnection: z.string().min(1),
  passphrase: z.string().min(8),
});

type FormType = z.infer<typeof formSchema>;

export const ConnectMethodRestoreConnection = () => {
  const history = useHistory();
  const setAuth = useAuth((state) => state.setAuth);
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qrAsDataUrl, setQRAsDataUrl] = useState<string>('');
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      encryptedConnection: '',
      passphrase: '',
    },
  });
  const onQrImageSelected: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ): Promise<void> => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    const file = event.target.files[0];
    const qrImageUrl = URL.createObjectURL(file);
    const codeReader = new BrowserQRCodeReader();
    const resultImage = await codeReader.decodeFromImageUrl(qrImageUrl);
    const encryptedConnection = resultImage.getText();
    // if (!encryptedConnection.startsWith('encrypted:')) {
    //   return;
    // }
    form.setValue('encryptedConnection', encryptedConnection);
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log('onload event', event);
      if (
        event?.target?.readyState !== event?.target?.DONE
      ) {
        return;
      }
      const dataUrl = event?.target?.result as string;
      setQRAsDataUrl(dataUrl)
    };
    reader.readAsDataURL(file);
  };
  const auth = (authData: SetupData) => {
    setAuth(authData);
    history.replace('/inboxes');
  };
  const restore = async (values: FormType) => {
    const decryptedValue = JSON.parse(values.encryptedConnection);
    auth(decryptedValue);
  };
  const removeImage = () => {
    setQRAsDataUrl('');
  };
  return (
    <div className="h-full flex flex-col space-y-3">
      <div className="grow-0 flex flex-col space-y-1">
        <div className="flex flex-row space-x-1">
          <FileKey />
          <span className="text-xl ">
            <FormattedMessage id="restore-connection-connection-method-title" />
          </span>
        </div>
        <span className="text-xs">
          <FormattedMessage id="restore-connection-connection-method-description" />
        </span>
      </div>

      <Form {...form}>
        <form
          className="h-full flex flex-col space-y-2 justify-between"
          onSubmit={form.handleSubmit(restore)}
        >
          <div className="grow flex flex-col space-y-3">
            <FormField
              control={form.control}
              name="encryptedConnection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="encrypted-connection" />
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-center">
                        {qrAsDataUrl ? (
                          <div className="relative">
                          <img alt="qr preview" className="h-[150px]" src={qrAsDataUrl} />
                          <Button className="absolute top-2 right-2 h-6 w-6" onClick={() => removeImage()} size="icon"><Trash className="w-4 h-4"/></Button>
                        </div>
                        ) : (
                          <label
                            className="flex flex-col items-center justify-center w-full h-[150px] border-2 border-dashed rounded-lg cursor-pointer bg-secondary-600 hover:bg-secondary-600"
                            htmlFor="dropzone-file"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <div>
                                <Upload className="w-4 h-4" />
                              </div>
                              <p className="text-sm text-gray-500">
                                <FormattedMessage id="click-to-upload" />
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG | JPEG
                              </p>
                            </div>
                            <input
                              accept="image/png, image/jpeg"
                              alt="shinaki node qr code input"
                              className="hidden"
                              id="dropzone-file"
                              onChange={(event) => onQrImageSelected(event)}
                              type="file"
                            />
                          </label>
                        )}
                      </div>
                      <Input {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            {error && <ErrorMessage message={'Error getting connection'} />}
          </div>

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <FormattedMessage id="restore-connection" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
