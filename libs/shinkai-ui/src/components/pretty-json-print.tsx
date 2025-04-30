import { useMemo } from 'react';

export const PrettyJsonPrint = ({ json }: { json: string | object }) => {
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
  return <pre className="overflow-x-scroll">{formattedJson}</pre>;
};
