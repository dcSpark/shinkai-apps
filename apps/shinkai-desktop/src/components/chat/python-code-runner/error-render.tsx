import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';

type ErrorRenderProps = { error: string };

export const ErrorRender = ({ error }: ErrorRenderProps) => {
  const i18n = useTranslation();

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center">
        <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-600" />
        <h3 className="font-bold text-red-700">
          {i18n.t('codeRunner.errorOccurred')}
        </h3>
      </div>
      <pre className="overflow-x-auto rounded-sm border border-red-100 bg-white p-3 text-sm whitespace-pre-wrap text-red-800">
        {error}
      </pre>
    </div>
  );
};
