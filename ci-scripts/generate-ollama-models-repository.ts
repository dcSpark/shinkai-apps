import * as cheerio from 'cheerio';
import axios from 'axios';
import * as z from 'zod';
import fs from 'fs';
import path from 'path';

const OllamaModelTag = z.object({
  name: z.string().min(1),
  size: z.string().min(1),
  hash: z.string().min(1),
  isDefault: z.boolean(),
});
const OllamaModelSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  defaultTag: z.string().min(1),
  tags: z.array(OllamaModelTag).min(1),
  supportTools: z.boolean(),
  embedding: z.boolean(),
  vision: z.boolean(),
});

type OllamaModelTag = z.infer<typeof OllamaModelTag>;
export type OllamaModel = z.infer<typeof OllamaModelSchema>;

const getOllamaModelsHtml = async (): Promise<string> => {
  const response = await axios.get('https://ollama.com/library');
  return response.data;
};

const getOllamaModelTagsHtml = async (model: string): Promise<string> => {
  const response = await axios.get(`https://ollama.com/library/${model}/tags`);
  return response.data;
};

const modelHtmlToObject = async (
  modelElement: cheerio.Element,
  $: cheerio.CheerioAPI,
): Promise<any> => {
  const name = $(modelElement).find('div h2 span').text().trim();
  const description = $(modelElement).find('div:nth-child(1) p').text().trim();
  const uiTags: string[] = $(modelElement)
    .find('div:nth-child(2) div:nth-child(1) span')
    .toArray()
    .map((el) => $(el).text().trim());
  const supportTools = uiTags.includes('tools');
  const embedding = uiTags.includes('embedding');
  const vision = uiTags.includes('vision');
  const modelTagsHtml = await getOllamaModelTagsHtml(name);
  const modelTagsApi = cheerio.load(modelTagsHtml);

  const getTags = (): OllamaModelTag[] => {
    const tags: OllamaModelTag[] = modelTagsApi(
      `body > main > div > section > div > div > div:not(:first-child)`,
    )
      .toArray()
      .map((el) => {
        const name = modelTagsApi(el).find('div > div:nth-child(1) a').text().trim();
        const hash = modelTagsApi(el)
          .find('div > div:nth-child(2) > span')
          .text()
          .trim();
        const size = modelTagsApi(el)
          .find('div > div:nth-child(1) > p:nth-child(2)')
          .text()
          .trim();
        const defaultElementText = modelTagsApi(el)
          .find('div > div:nth-child(1) span span')
          .text()
          .trim();
        const isDefault = defaultElementText === 'Latest';
        return { name, hash, size, isDefault };
      });
    return tags.filter((tag) => tag.name !== 'latest');
  };
  const tags = getTags();

  const defaultTag = tags.find((t) => t.isDefault)?.name || tags[0]?.name;
  return {
    name,
    description,
    supportTools,
    defaultTag,
    tags: tags,
    embedding,
    vision,
  };
};
const main = async () => {
  const modelsHtml = await getOllamaModelsHtml();
  const $ = cheerio.load(modelsHtml);
  const modelsElement = $('#repo ul li a');
  const models: OllamaModel[] = await Promise.all(
    modelsElement.toArray().map(async (el) => {
      const model = await modelHtmlToObject(el, $);
      return model;
    }),
  );
  models
    .filter((model) => !model.name.includes('llama3.2'))
    .forEach((model) => {
      console.log('model', model);
      const result = OllamaModelSchema.safeParse(model);
      if (result.error) {
        throw new Error(
          `Error in model ${model.name}\n${JSON.stringify(result.error, undefined, 2)}`,
        );
      }
    });
  const outputPath = path.join(
    __dirname,
    '../apps/shinkai-desktop/src/lib/shinkai-node-manager/ollama-models-repository.json',
  );
  fs.writeFileSync(outputPath, JSON.stringify(models, null, 2), 'utf8');
  console.log(`Models data has been written to ${outputPath}`);
};

main();
