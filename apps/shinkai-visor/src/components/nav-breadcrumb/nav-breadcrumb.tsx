import './nav-breadcrumb.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { Separator } from '../ui/separator';

type BreadcrumbItem = {
  path: string;
  title: string;
};

export const NavBreadcrumb = () => {
  const location = useLocation();
  const intl = useIntl();
  const [breadcrumbItems, setItems] = useState<BreadcrumbItem[]>([]);
  // TODO: Add i18n to this component
  const pathToIntlDefinition = useMemo(() => new Map<string, string>([]), []);
  const mapLocationToItems = useCallback(
    (paths: string[]): BreadcrumbItem[] => {
      const items = paths.map<BreadcrumbItem>((path) => {
        const intlId = pathToIntlDefinition.get(path);
        const title = pathToIntlDefinition.get(path)
          ? intl.formatMessage({ id: intlId })
          : decodeURIComponent(path);
        return {
          path: path,
          title,
        };
      });
      return items;
    },
    [intl, pathToIntlDefinition],
  );
  useEffect(() => {
    const paths = location.pathname.split('/').filter((path) => path);
    const items = mapLocationToItems(paths);
    setItems(items);
  }, [location, intl, pathToIntlDefinition, mapLocationToItems]);
  return (
    <div className="flex flex-row h-5 items-center space-x-2 text-sm">
      {breadcrumbItems.map((breadcrumbItem) => (
        <div className="flex flex-row h-4 space-x-2 items-center max-w-20" key={breadcrumbItem.path}>
          <div className="text-ellipsis overflow-hidden whitespace-nowrap">{breadcrumbItem.title}</div>
          <Separator orientation="vertical" />
        </div>
      ))}
    </div>
  );
};
