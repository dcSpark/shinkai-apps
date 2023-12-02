import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  PaperClipIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ImagePlusIcon, PlusIcon, X } from 'lucide-react';
import { useEffect } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import SimpleLayout from './layout/simple-layout';

const createJobSchema = z.object({
  model: z.string(),
  description: z.string(),
  files: z.array(z.any()).optional(),
});

export const FileList = ({
  files,
  className,
}: {
  files: ({ name: string; size?: number } | File)[];
  className?: string;
}) => {
  if (!files) return null;
  return (
    <div className={cn('flex w-full flex-col', className)}>
      {files?.map((file, idx) => (
        <div
          className="relative flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3"
          key={idx}
        >
          <PaperClipIcon className="text-gray-100" />
          <span className="text-gray-80 flex-1 truncate text-sm">
            {file.name}
          </span>
        </div>
      ))}
    </div>
  );
};

const FileInput = ({
  value,
  onChange,
  maxFiles,
  accept,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: Accept;
}) => {
  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: true,
      maxFiles: maxFiles ?? 5,
      accept,
      onDrop: (acceptedFiles) => {
        onChange(acceptedFiles);
      },
    });

  return (
    <>
      <div className="flex gap-5">
        <div
          {...getRootFileProps({
            className:
              'dropzone group relative mt-3 flex h-[6.375rem] w-[9.5rem] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-100 transition-colors hover:border-white',
          })}
        >
          <div className="flex flex-col items-center gap-2 p-4 text-xs">
            <ImagePlusIcon className="stroke-gray-100 transition-colors group-hover:stroke-white" />
            <span className="text-center font-semibold text-gray-100">
              Drag & drop your documents here
            </span>
          </div>
          <input {...getInputFileProps({})} />
        </div>
        <span className="text-gray-80 pt-4 text-xs font-bold">
          Supported formats
          <p className="mt-2">
            Plain Text
            <span className="block font-normal">
              {' '}
              {[
                'eml',
                'html',
                'json',
                'md',
                'msg',
                'rst',
                'rtf',
                'txt',
                'xml',
              ].join(' • ')}
            </span>
          </p>
          <p className="text-gray-80 mt-1 font-bold">
            Documents
            <span className="block font-normal">
              {[
                'csv',
                'doc',
                'epub',
                'odt',
                'pdf',
                'ppt',
                'pptx',
                'tsv',
                'xlsx',
              ].join(' • ')}
            </span>
          </p>
        </span>
      </div>
      {!!value?.length && (
        <div className="flex flex-col gap-2 pt-8">
          {value?.map((file, idx) => (
            <div
              className="relative flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3"
              key={idx}
            >
              <PaperClipIcon className="text-gray-100" />
              <span className="text-gray-80 flex-1 truncate text-sm">
                {file.name}
              </span>
              <button
                className="h-6 w-6 cursor-pointer rounded-full bg-gray-400 p-1 transition-colors hover:bg-gray-300"
                onClick={() => {
                  const newFiles = [...value];
                  newFiles.splice(newFiles.indexOf(file), 1);
                  onChange(newFiles);
                }}
                type={'button'}
              >
                <X className="h-full w-full text-gray-100" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export function isImageOrPdf(file: File): boolean {
  if (!file) return false;
  return (
    file?.type.startsWith('image/') || file?.type.startsWith('application/pdf')
  );
}
const CreateJobPage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const createJobForm = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
  });

  const { agents, isSuccess } = useAgents({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      // TODO: job_inbox, false is hardcoded
      navigate(
        `/inboxes/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );
    },
  });

  const onSubmit = async (data: z.infer<typeof createJobSchema>) => {
    if (!auth) return;
    await createJob({
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: data.model,
      content: data.description,
      files_inbox: '',
      files: data.files,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  useEffect(() => {
    if (isSuccess && agents?.length) {
      createJobForm.setValue('model', agents[0].id);
    }
  }, [agents, createJobForm, isSuccess]);
  // useEffect(() => {
  //   return () => {
  //     file && URL.revokeObjectURL(file.preview);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <SimpleLayout title="Create Job">
      <Form {...createJobForm}>
        <form
          className="space-y-8"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <FormField
              control={createJobForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tell us the job you want to do</FormLabel>
                  <FormControl>
                    <Textarea
                      autoFocus={true}
                      className="resize-none"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          createJobForm.handleSubmit(onSubmit)();
                        }
                      }}
                      placeholder="Eg: Explain me how internet works..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createJobForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your AI Agent</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your AI Agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents?.length ? (
                        agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <span>{agent.id} </span>
                          </SelectItem>
                        ))
                      ) : (
                        <Button
                          onClick={() => {
                            navigate(ADD_AGENT_PATH);
                          }}
                          variant="ghost"
                        >
                          <PlusIcon className="mr-2" />
                          Add Agents
                        </Button>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={createJobForm.control}
              name="files"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel className="sr-only">
                    Upload a file (optional)
                  </FormLabel>
                  <FormControl>
                    <FileInput onChange={field.onChange} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create Job
          </Button>
        </form>
      </Form>
    </SimpleLayout>
  );
};
export default CreateJobPage;
