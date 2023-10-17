import { IonAvatar } from '@ionic/react';

import { cn } from '../../theme/lib/utils';

export default function Avatar({
  url,
  className,
}: {
  url?: string;
  className?: string;
}) {
  return (
    <IonAvatar
      className={cn('bg-white w-8 h-8 [--border-radius:7777px]', className)}
    >
      <img
        alt=""
        className="w-full h-full"
        src={url ?? 'https://ionicframework.com/docs/img/demos/avatar.svg'}
      />
    </IonAvatar>
  );
}
