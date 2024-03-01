import { NodeFile } from './types';

export const DUMMY_FILES: NodeFile[] = [
  {
    type: 'folder',
    name: 'Learning_Resources',
    creation_date: '2023-01-01',
    items: [
      {
        type: 'folder',
        name: 'Programming',
        creation_date: '2023-03-01',
        items: [
          {
            type: 'file',
            name: 'Stack_Overflow.html',
            creation_date: '2023-03-01',
            size: 3072,
            file_extension: '.html',
          },
        ],
      },
      {
        type: 'file',
        name: 'OpenAI.html',
        creation_date: '2023-01-01',
        size: 1024,
        file_extension: '.html',
      },
      {
        type: 'file',
        name: 'Coursera.html',
        creation_date: '2023-02-01',
        size: 2048,
        file_extension: '.html',
      },
    ],
  },
  {
    type: 'folder',
    name: 'Fun_Stuff',
    creation_date: '2023-04-01',
    items: [
      {
        type: 'file',
        name: 'YouTube.html',
        creation_date: '2023-04-01',
        size: 4096,
        file_extension: '.html',
      },
    ],
  },
  {
    type: 'file',
    name: 'Wikipedia.html',
    creation_date: '2023-05-01',
    size: 5120,
    file_extension: '.html',
  },
  {
    type: 'file',
    name: 'GitHub.html',
    creation_date: '2023-06-01',
    size: 6144,
    file_extension: '.html',
  },
];

export const getNodeFiles = async () => {
  const nodeFiles = new Promise<NodeFile[]>((resolve) => {
    setTimeout(() => {
      resolve(DUMMY_FILES);
    }, 1000);
  });
  return nodeFiles;
};
