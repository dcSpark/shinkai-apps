import {
  // getFileNames,
  getLastMessagesFromInboxWithBranches,
} from '@shinkai_network/shinkai-message-ts/api';
import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';

// import {
//   calculateMessageHash,
//   getMessageContent,
//   getMessageFilesInbox,
//   isLocalMessage,
// } from '@shinkai_network/shinkai-message-ts/utils';
import {
  // ChatConversationBranchesMessage,
  GetChatConversationBranchesInput,
  // GetChatConversationBranchesOutput,
} from './types';
import { CONVERSATION_PAGINATION_LIMIT } from './useGetChatConversationBranchesWithPagination';

type ResponseItem = {
  hash: string;
  inboxId: string;
  content: string;
  sender: { avatar: string };
  isLocal: boolean;
  scheduledTime: string;
  parentHash?: string;
};

function flattenMessagesWithParentHash(
  messages: ResponseItem[][],
): ResponseItem[] {
  const flattenedMessages: ResponseItem[] = [];

  messages.forEach((messageGroup, index) => {
    messageGroup.forEach((message, subIndex) => {
      const newMessage = {
        ...message,
        parentHash: index === 0 ? 'root' : messages[index - 1][0].hash,
      };

      flattenedMessages.push(newMessage);
    });
  });

  return flattenedMessages;
}
export const getChatConversationBranches = async ({
  nodeAddress,
  inboxId,
  count = CONVERSATION_PAGINATION_LIMIT,
  lastKey,
  shinkaiIdentity,
  profile,
  profile_encryption_sk,
  profile_identity_sk,
  node_encryption_pk,
}: GetChatConversationBranchesInput): Promise<ResponseItem[]> => {
  const data: ShinkaiMessage[] = await getLastMessagesFromInboxWithBranches(
    nodeAddress,
    inboxId,
    count,
    lastKey,
    {
      shinkai_identity: shinkaiIdentity,
      profile: profile,
      profile_encryption_sk,
      profile_identity_sk,
      node_encryption_pk,
    },
  );
  console.log(data, 'from branches');

  return flattenMessagesWithParentHash([
    [
      {
        hash: '0bf3d6e3206fe13e1b39f494b3764ef375065cff24301c7109fb8f9a75d5b479',
        inboxId: 'job_inbox::jobid_ec56a71a-3a7d-413e-a2eb-6e0839c20a74::false',
        content: 'hi there - branch',
        sender: {
          avatar:
            'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0',
        },
        isLocal: true,
        scheduledTime: '2024-02-07T17:41:19.995Z',
      },
    ],
    [
      {
        hash: '57b61385ac57ccdbc3447a8175b7442d7a2fe9aafcbf5203dc9e719411f6db7d',
        inboxId: 'job_inbox::jobid_ec56a71a-3a7d-413e-a2eb-6e0839c20a74::false',
        content:
          "Hello! It seems like you've mentioned 'branch' but haven't provided any context. A branch can refer to many things. In a biological context, it's a part of a tree or plant that grows out from the trunk or from a main stem. In computing, it could refer to a code branch, which is a separate line of development in version control systems. In banking, a branch refers to a retail location. If you have a specific question or need information on a particular type of branch, please provide more details!",
        sender: {
          avatar:
            'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
        },
        isLocal: false,
        scheduledTime: '2024-02-07T17:41:31.323Z',
      },
    ],
    [
      {
        hash: 'aa0e90e6bf1b18fbb2c030d80045f7921da6dd091ef5927939485e4119e1721a',
        inboxId: 'job_inbox::jobid_ec56a71a-3a7d-413e-a2eb-6e0839c20a74::false',
        content: 'what is css in 3 words',
        sender: {
          avatar:
            'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0',
        },
        isLocal: true,
        scheduledTime: '2024-02-07T17:43:19.043Z',
      },
      {
        hash: 'cb7d1f23b5989d60de7e3a19aaed8433018540cfb11bad1c6dbd5c5ab973d1b1',
        inboxId: 'job_inbox::jobid_ec56a71a-3a7d-413e-a2eb-6e0839c20a74::false',
        content: 'what is css in 3 words',
        sender: {
          avatar:
            'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0',
        },
        isLocal: true,
        scheduledTime: '2024-02-07T17:41:45.434Z',
      },
    ],
    [
      {
        hash: 'c9416635042f79b6dd1fd61418161bffcd2ae8fc83729e99b09544ea71c8ec9a',
        inboxId: 'job_inbox::jobid_ec56a71a-3a7d-413e-a2eb-6e0839c20a74::false',
        content: 'Cascading Style Sheets',
        sender: {
          avatar:
            'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
        },
        isLocal: false,
        scheduledTime: '2024-02-07T17:43:24.958Z',
      },
    ],
  ]);

  // const transformedMessagePromises: Promise<ChatConversationBranchesMessage>[] =
  //   data
  //     .flatMap((subArray) => subArray)
  //     .map(async (shinkaiMessage) => {
  //       const filesInbox = getMessageFilesInbox(shinkaiMessage);
  //       const content = getMessageContent(shinkaiMessage);
  //       const isLocal = isLocalMessage(
  //         shinkaiMessage,
  //         shinkaiIdentity,
  //         profile,
  //       );
  //       const message: ChatConversationBranchesMessage = {
  //         hash: calculateMessageHash(shinkaiMessage),
  //         inboxId,
  //         content,
  //         sender: {
  //           avatar: isLocal
  //             ? 'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0'
  //             : 'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
  //         },
  //         isLocal,
  //         scheduledTime: shinkaiMessage.external_metadata?.scheduled_time,
  //       };
  //       if (filesInbox) {
  //         const fileNames = await getFileNames(
  //           nodeAddress,
  //           shinkaiIdentity,
  //           profile,
  //           shinkaiIdentity,
  //           {
  //             profile_encryption_sk: profile_encryption_sk,
  //             profile_identity_sk: profile_identity_sk,
  //             node_encryption_pk: node_encryption_pk,
  //           },
  //           inboxId,
  //           filesInbox,
  //         );
  //         message.fileInbox = {
  //           id: filesInbox,
  //           files: (fileNames.data || []).map((fileName) => ({
  //             name: fileName,
  //           })),
  //         };
  //       }
  //       return message;
  //     });
  // return Promise.all(transformedMessagePromises);
};
