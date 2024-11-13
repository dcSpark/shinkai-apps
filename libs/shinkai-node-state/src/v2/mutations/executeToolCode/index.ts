import { executeToolCode as executeToolCodeApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { ExecuteToolCodeInput } from './types';

export const executeToolCode = async ({
  nodeAddress,
  token,
  toolType,
  toolRouterKey,
  params,
}: ExecuteToolCodeInput) => {
  return await executeToolCodeApi(nodeAddress, token, {
    tool_type: 'denodynamic',
    tool_router_key: 'deno:::ok',
    parameters: {
      code: 'import axios from "npm:axios";  async function shinkaiToolDownloadPages(urls: string[]): Promise<{   markdowns: string[]; }> {   const _url = "http://localhost:9950/v2/tool_execution";   const data = {       tool_router_key: "local:::shinkai-tool-download-pages:::shinkai__download_pages",       tool_type: "js",       parameters: {           urls: urls,       },   };   const response = await axios.post(_url, data, {       headers: {           "Authorization": `Bearer ${process.env.BEARER}`       }   });   return response.data; }  type CONFIG = {}; type INPUTS = {   urls: string[]; }; type OUTPUT = {   markdowns: string[]; };  async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {    const urls = inputs.urls;   if (!urls || !urls.length) {     throw new Error("Nox URLs provided" + JSON.stringify({config, inputs}));   }    try {     const result = await shinkaiToolDownloadPages(urls);     return {       markdowns: result.data.markdowns,     };   } catch (error) {     throw error;   } }',
      urls: ['https://jhftss.github.io/'],
    },
  });
};
