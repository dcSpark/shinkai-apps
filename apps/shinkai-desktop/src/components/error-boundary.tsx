import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';

const FullPageErrorFallback = ({ error }: { error: Error }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex h-screen flex-col items-center justify-center px-8 text-red-400"
      role="alert"
    >
      <p>{t('errorBoundary.genericError')}</p>
      <pre className="mb-4 whitespace-pre-wrap text-balance break-all text-center">
        {error.message}
      </pre>
      <Button
        onClick={() => window.location.reload()}
        size="sm"
        variant="outline"
      >
        {t('common.refresh')}
      </Button>
    </div>
  );
};
export default FullPageErrorFallback;
