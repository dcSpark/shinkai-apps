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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { FileCheck2, ImagePlusIcon, PlusIcon, X } from 'lucide-react';
import { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { cn } from '../lib/utils';
import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import SimpleLayout from './layout/simple-layout';

const createJobSchema = z.object({
  model: z.string(),
  description: z.string(),
  files: z.array(z.any()),
});

const FileInput = ({
  value,
  onChange,
}: {
  value: File[];
  onChange: (files: File[]) => void;
}) => {
  const {
    getRootProps: getRootFileProps,
    getInputProps: getInputFileProps,
    acceptedFiles,
  } = useDropzone({
    multiple: true,
    maxFiles: 5,

    // accept: {
    //   "image/png": [".png"],
    //   "text/html": [".html", ".htm"],
    //   "application/pdf": [".pdf"],
    // },
    onDrop: (acceptedFiles) => {
      onChange(acceptedFiles);
      // if (isImageOrPdf(file)) {
      //   const reader = new FileReader();
      //   reader.addEventListener('abort', () =>
      //     console.log('file reading was aborted'),
      //   );
      //   reader.addEventListener(
      //     'load',
      //     (event: ProgressEvent<FileReader>) => {
      //       const binaryUrl = event.target?.result;
      //       const image = new Image();
      //       image.addEventListener('load', function () {
      //         const imageInfo = Object.assign(file, {
      //           preview: URL.createObjectURL(file),
      //         });
      //         createJobForm.setValue('file', imageInfo, {
      //           shouldValidate: true,
      //         });
      //       });
      //       image.src = binaryUrl as string;
      //     },
      //   );
      //   reader.readAsDataURL(file);
      // } else {
      //   createJobForm.setValue('file', file, { shouldValidate: true });
      // }
    },
  });

  const removeFile = (file: File) => () => {
    console.log('qweqweqweqw');
    // const newFiles = [...value];
    // console.log(newFiles, 'newFiles');
    // newFiles.splice(newFiles.indexOf(file), 1);
    // console.log(newFiles, 'newFiles2');
    // onChange(newFiles);
    // setValue("presentation-screens", newFiles);
  };

  return (
    <>
      <div className="flex gap-5">
        <div
          {...getRootFileProps({
            className: cn(
              'dropzone group relative relative mt-3 flex h-[6.375rem] w-[9.5rem] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-500 border-slate-500 transition-colors hover:border-white',
              // file && 'border border-solid border-slate-500',
            ),
          })}
        >
          <div className="flex flex-col items-center gap-2 p-4 text-xs">
            <ImagePlusIcon className="stroke-slate-500 transition-colors group-hover:stroke-white" />
            <span className="text-center  font-semibold text-slate-400">
              Drag & drop your documents here
            </span>
            {/* <span className="text-foreground">Click here to Upload</span> */}
          </div>
          {/*{...createJobForm.register('file')}*/}
          <input {...getInputFileProps({})} />
          {/*{file && (*/}
          {/*  <>*/}
          {/*    {isImageOrPdf(file) && (*/}
          {/*      <img*/}
          {/*        alt=""*/}
          {/*        className="absolute inset-0 h-full w-full rounded-lg bg-white object-cover"*/}
          {/*        src={file.preview}*/}
          {/*      />*/}
          {/*    )}*/}
          {/*    {!isImageOrPdf(file) && (*/}
          {/*      <div className="flex flex-col items-center gap-2">*/}
          {/*        <FileCheck2 className="text-gray-80 h-6 w-6 " />*/}
          {/*        <span className="line-clamp-3 break-all px-2 text-center text-xs ">*/}
          {/*          {file?.name}*/}
          {/*        </span>*/}
          {/*      </div>*/}
          {/*    )}*/}
          {/*  </>*/}
          {/*)}*/}
          {/*{file != null && (*/}
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
      <div className="flex flex-col gap-6 pt-8">
        {acceptedFiles?.map((file, idx) => (
          <div className="relative flex" key={idx}>
            <span>
              {file.path} - {file.type} bytes
            </span>
            <button
              className="absolute right-1 top-1 h-6 w-6 cursor-pointer rounded-full bg-gray-400 p-1 transition-colors hover:bg-gray-300"
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
                  {/*<FormLabel className="sr-only">*/}
                  {/*  Upload a file (optional)*/}
                  {/*</FormLabel>*/}
                  <FormControl>
                    <FileInput
                      // multiple
                      onChange={field.onChange}
                      value={field.value}
                    />
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
