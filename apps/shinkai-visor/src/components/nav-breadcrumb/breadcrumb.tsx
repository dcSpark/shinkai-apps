import { Breadcrumb } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

export const NavBreadcrumb = () => {
  const location = useLocation();
  const intl = useIntl();
  const [breadcrumbItems, setItems] = useState<ItemType[]>([]);
  // TODO: Add i18n to this component
  const pathToIntlDefinition  = useMemo(() => new Map<string, string>([]), []);
  const mapLocationToItems = useCallback((paths: string[]): ItemType[] => {
    const items = paths.map<ItemType>((path) => {
      const intlId = pathToIntlDefinition.get(path);
      const title = pathToIntlDefinition.get(path) ? intl.formatMessage({ id: intlId }) : path;
      return {
        path: path,
        title,
      }
    });
    return items;
  }, [intl, pathToIntlDefinition]);
  useEffect(() => {
    const paths = location.pathname.split('/').filter(path => path);
    const items = mapLocationToItems(paths);
    setItems(items);
  }, [location, intl, pathToIntlDefinition, mapLocationToItems])
  return (<Breadcrumb items={breadcrumbItems}/>);
};
