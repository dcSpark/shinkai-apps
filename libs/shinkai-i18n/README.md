# Shinkai i18n

This package uses [i18next](https://react.i18next.com/) to translate the app. All the translations
are stored inside the [locales](./src/lib/locales) directory. This means all texts within the app
need to be rendered using the `t` function, returned by `useTranslation`:

```tsx
import { useTranslation } from '@shinkai_network/shinkai-i18n';

const Component: React.FC = () => {
  const { t } = useTranslation();

  return <>{t('componentName.textKey')}</>;
};
```

If a text contains HTML or JSX elements, then the `Trans` component can be used instead:

```tsx
import { useTranslation } from '@shinkai_network/shinkai-i18n';

const Component: React.FC = () => {
  const { Trans } = useTranslation();

  return (
    <Trans i18nKey="componentName.textKey" components={{ Anchor: <a href="https://acme.com" /> }} />
  );
};
```

If a text needs to be accessed from outside of a component, then the `t` function exported by the
translation client can be used:

```tsx
import { t } from '@shinkai_network/shinkai-i18n';

const myFunction
() => t('functionName.textKey');
```

Note that this should only be used in cases where we can't use `useTranslation`. The hook does extra
processing, hence why it is preferred in all other cases.


