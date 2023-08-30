import { IonAvatar } from '@ionic/react';
import { cn } from '@shinkai_network/shinkai-ui/utils';
export default function Avatar({
  url,
  className,
}: {
  url?: string;
  className?: string;
}) {
  return (
    <IonAvatar
      className={cn('h-8 w-8 bg-white [--border-radius:7777px]', className)}
    >
      <img
        alt=""
        className="h-full w-full"
        src={url ?? 'https://ionicframework.com/docs/img/demos/avatar.svg'}
      />
    </IonAvatar>
  );
}
