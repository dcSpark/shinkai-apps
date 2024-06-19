# Shinkai i18n

This package uses [i18next](https://react.i18next.com/) to translate the app. All the translations
are stored inside the [locales](locales) directory. This means all texts within the app
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


## How to add a new i18n text

1. Add the new text to the [default translations file](./src/lib/default). 
2. Run `npx nx generate-i18n shinkai-i18n` to generate the new translations in the [locales](locales) directory. This will only update the default locale (en-US).
3. Update the translations in the [locales](locales) directory as needed.

## How to remove a i18n text
To delete, you just need to remove the code in which is being used, then run `npx nx generate-i18n shinkai-i18n` and it will take care of updating the all the locales.






