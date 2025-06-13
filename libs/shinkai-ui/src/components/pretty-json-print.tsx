import { useMemo } from 'react';
import { cn } from '../utils';

export const PrettyJsonPrint = ({
  json,
  className,
}: {
  json: string | object;
  className?: string;
}) => {
  const formattedJson = useMemo(() => {
    let formattedValue = `Unparseable JSON: String(${json})`;
    if (typeof json === 'object') {
      formattedValue = JSON.stringify(json, null, 2);
    } else if (typeof json === 'string') {
      try {
        const parsedJson = JSON.parse(json);
        formattedValue = JSON.stringify(parsedJson, null, 2);
      } catch (error) {
        console.error('error parsing json', error);
      }
    }
    return formattedValue;
  }, [json]);
  return (
    <pre className={cn('overflow-x-scroll', className)}>{formattedJson}</pre>
  );
};
