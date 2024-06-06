import { zodResolver } from '@hookform/resolvers/zod';
import { publicKeysSchema } from '@shinkai_network/shinkai-node-state/forms/settings/public-keys';
import {
  buttonVariants,
  CopyToClipboardIcon,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ExternalLinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useGalxeGenerateDesktopInstallationProofQuery } from '../lib/galxe/galxe-client';
import { SubpageLayout } from './layout/simple-layout';

export const GalxeValidation = () => {
  const { data: installationProof } =
    useGalxeGenerateDesktopInstallationProofQuery();

  const form = useForm<{ proof: string }>({
    resolver: zodResolver(publicKeysSchema),
    defaultValues: {
      proof: `${installationProof?.[0]}:::${installationProof?.[1]}`,
    },
  });

  return (
    <SubpageLayout title="Galxe Validation">
      <div className="flex grow flex-col space-y-2">
        <Form {...form}>
          <form className="flex flex-col justify-between space-y-8">
            <div className="flex grow flex-col space-y-5">
              <div>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    disabled={true}
                    name="proof"
                    render={({ field }) => (
                      <TextField
                        classes={{
                          input: 'font-mono',
                        }}
                        endAdornment={
                          <div className="w-8">
                            <CopyToClipboardIcon
                              className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                              string={field.value}
                            />
                          </div>
                        }
                        field={{ ...field, readOnly: true }}
                        helperMessage={
                          <span className="text-gray-80 inline-flex items-center gap-1 px-1 py-2.5 hover:text-white">
                            <a
                              className={cn(
                                buttonVariants({
                                  size: 'auto',
                                  variant: 'link',
                                }),
                                'rounded-lg p-0 text-xs text-inherit underline',
                              )}
                              href={`https://app.galxe.com/quest/shinkai/GCeQitd47H`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Validate your Shinkai Installation
                            </a>
                            <ExternalLinkIcon className="h-4 w-4" />
                          </span>
                        }
                        label="Installation Proof"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </SubpageLayout>
  );
};
