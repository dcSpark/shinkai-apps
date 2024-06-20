export default {
  extension: {
    welcome:
      'Transform your web browsing experience using AI with Shinkai Visor ✨',
  },
  layout: {
    sidebar: {
      toggle: 'Toggle Sidebar',
    },
    menuItems: {
      chats: 'Chats',
      aiTasks: 'AI Tasks',
      vectorFs: 'My AI Files Explorer',
      vectorSearch: 'AI Files Content Search',
      workflowPlayground: 'Workflow Playground',
      subscriptions: 'Browse Subscriptions',
      mySubscriptions: 'My Subscriptions',
      agents: 'AIs',
      settings: 'Settings',
      disconnect: 'Disconnect',
    },
  },
  chat: {
    chats: 'Chats',
    emptyStateTitle: 'Ask Shinkai AI',
    emptyStateDescription:
      'Try “How to make a HTTP request in JavaScript” , “Give me the top 10 rock music in the 80s”, “Explain me how internet works”',
    create: 'Create AI Chat',
    allMessagesLoaded: 'All previous messages have been loaded ✅',
    limitReachedTitle: 'Limit Reached',
    limitReachedDescription:
      "You've used all of your queries for the month on this model/agent. Please start a new chat with another agent.",
    enterMessage: 'Enter Message',
    sendMessage: 'Send Message',
    form: {
      message: 'Tell us the job you want to do',
      messagePlaceholder: 'Eg: Explain me how internet works...',
      workflows: 'Workflows',
      selectAI: 'Select your AI',
      setContext: 'Set Chat Context',
      setContextText:
        'Add files or folders for your AI to use as context during your conversation.',
    },
    context: {
      title: 'Conversation Context',
      description:
        'List of folders and files used as context for this conversation',
    },
    actives: {
      label: 'Actives',
      notFound: 'No active conversations found.',
    },
    archives: {
      label: 'Archives',
      archive: 'Archive',
      notFound: 'No archived conversations found.',
      success: 'Your conversation has been archived',
      error: 'Error archiving job',
    },
  },
  inboxes: {
    updateName: 'Update inbox name',
    inboxName: 'Name',
  },
  shinkaiNode: {
    restartNode: 'Please restart your Shinkai Node',
    nodeAddress: 'Node Address',
    nodeVersion: 'Node Version',
  },
  settings: {
    defaultAgent: 'Default AI',
    shinkaiIdentity: {
      label: 'Shinkai Identity',
      updatedIdentity: 'Shinkai Identity updated successfully.',
    },
    quickAccessButton: {
      label: 'Show Shinkai Quick Access Button',
      description:
        'The Quick Access Button can be moved by clicking and holding.',
    },
    shortcutKey: {
      label: 'Shortcut Key',
      description: 'Modify the shortcut key to launch sidebar',
    },
    exportConnection: {
      label: 'Export connection',
    },
    registerNewCode: {
      label: 'Register new device',
    },
  },
  exportConnection: {
    label: 'Export Connection',
    generateFile: 'Generate connection file',
    downloadText: 'Download and keep this connection file in a safe place',
    restoreText:
      'Use it with your passphrase to restore the connection to your Shinkai Node',
  },
  common: {
    uploadFile: 'Upload a File',
    folders: 'Folders',
    folderWithCount_one: '{{count}} Folder',
    folderWithCount_other: '{{count}} Folders',
    files: 'Files',
    file: 'File',
    fileWithCount_one: '{{count}} File',
    fileWithCount_other: '{{count}} Files',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    connect: 'Connect',
    rename: 'Rename',
    disconnect: 'Disconnect',
    soon: 'soon',
    back: 'Back',
    edit: 'Edit',
    delete: 'Delete',
    update: 'Update',
    moreOptions: 'More Options',
    comingSoon: 'Coming soon - Early July',
    noThanks: 'No, Thanks',
    iAgree: 'I Agree',
    getStarted: 'Get Started',
    passphrase: 'Passphrase',
    repeatPassphrase: 'Confirm passphrase',
  },
  analytics: {
    title: 'Help us improve Shinkai',
    bulletPoints: {
      one: '✅ Always allow you to opt-out via Settings',
      two: '✅ Randomized Analytics',
      three:
        '✅ Send analytical information about what features you use but without any content or responses',
      four: '❌ Never collect your IP address',
      five: '❌ Never collect your AI queries',
      six: '❌ Never use personal information for training purposes',
    },
    moreInfo:
      'Fore more information in relation to our privacy practices, please see our <a>Privacy Policy</a>',
  },
  agents: {
    label: 'AIs',
    add: 'Add AI',
    addManually: 'Manually Add AI',
    delete: {
      label: 'Delete AI',
      description:
        'Are you sure you want to delete this AI? This action cannot be undone.',
    },
    switch: 'Switch AI',
    notFound: {
      title: 'No available AIs',
      description:
        'Connect your first AI to start asking Shinkai AI. Try connecting OpenAI',
    },
    localAI: {
      installTitle: 'Install AI Models',
      installText:
        'After installing AI models on your local machine, they will become available as AI',
    },
    form: {
      agentName: 'AI Name',
      externalUrl: 'External URL',
      apiKey: 'API Key',
      modelName: 'Model Name',
      modelId: 'Model ID',
    },
    success: {
      createAgent: 'AI created successfully',
      deleteAgent: 'AI deleted successfully',
      updateAgent: 'AI updated successfully',
    },
    errors: {
      createAgent: 'Error adding AI',
      updateAgent: 'Error updating AI',
      deleteAgent: 'Error deleting AI',
    },
  },
  disconnect: {
    modalTitle: 'Disconnect Shinkai',
    modalDescription:
      'Are you sure you want to disconnect? This will permanently delete your data',
    exportConnection:
      'Before continuing, please<Link>export your connection</Link>to restore your connection at any time.',
  },
  errors: {
    nodeUnavailable: {
      title: 'Node Unavailable',
      description:
        "We're having trouble connecting to your Shinkai Node. Your node may be offline, or your internet connection may be down.",
    },
  },
  notifications: {
    messageReceived: {
      label: 'Message Received',
      description: 'You have received a response from {{inboxName}}',
    },
  },
};
