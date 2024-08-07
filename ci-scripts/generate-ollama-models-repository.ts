import * as cheerio from 'cheerio';
import axios from 'axios';
import * as z from 'zod';
import fs from 'fs';
import path from 'path';

const OllamaModelTag = z.object({
  name: z.string().min(1),
  size: z.string().min(1),
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

const getOllamaModelHtml = async (model: string): Promise<string> => {
  const response = await axios.get(`https://ollama.com/library/${model}`);
  return response.data;
};

const modelHtmlToObject = async (
  modelElement: cheerio.Element,
  $: cheerio.CheerioAPI,
): Promise<any> => {
  const name = $(modelElement).find('div h2 span').text().trim();
  const description = $(modelElement)
    .find('div:nth-child(2) p:first-child')
    .text()
    .trim();
  const uiTags: string[] = $(modelElement)
    .find('div:nth-child(2) div:nth-child(2) span')
    .toArray()
    .map((el) => $(el).text().trim());
  const supportTools = uiTags.includes('Tools');
  const embedding = uiTags.includes('Embedding');
  const vision = uiTags.includes('Vision');
  const modelHtml = await getOllamaModelHtml(name);
  const modelApi = cheerio.load(modelHtml);

  const getTags = (
    id: string,
  ): { defaultTag: string; tags: OllamaModelTag[] } => {
    let defaultTag = '';
    const tags: OllamaModelTag[] = modelApi(`${id} a`)
      .toArray()
      .map((el) => {
        const name = modelApi(el).find('> div span:first-child').text().trim();
        const isDefault =
          modelApi(el).find('> div span:nth-child(2)')?.text().trim() ===
          'latest';
        if (isDefault) {
          defaultTag = name;
        }
        const size = modelApi(el).find('> span:nth-child(2)').text().trim();
        return { name, size };
      })
      .filter((tag) => tag.name !== 'latest');
    return { defaultTag, tags };
  };
  const primaryTags = getTags('#primary-tags');
  const secondaryTags = getTags('#secondary-tags');

  const tags = [...primaryTags.tags, ...secondaryTags.tags];
  const defaultTag = primaryTags.defaultTag || tags[0]?.name;
  return {
    name,
    description,
    supportTools,
    defaultTag,
    tags,
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
  models.forEach((model) => {
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
