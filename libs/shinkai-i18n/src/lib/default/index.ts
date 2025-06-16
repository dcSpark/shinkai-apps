export default {
  extension: {
    welcome:
      'Transform your web browsing experience using AI with Shinkai Visor ✨',
  },
  homepage: {
    welcomeTitle: 'How can I help you today?',
    agentConfigurationRequired:
      '{{agentName}} requires some configurations to work properly.',
    setupAgent: 'Setup Agent',
    recommendedAgents: 'Recommended Agents',
    installingDefaultAgents: 'Installing default agents',
    shiftEnterForNewLine: '<span>Shift + Enter</span> for a new line',
    enterToSend: '<span>Enter</span> to send',
  },
  desktop: {
    welcome: 'Welcome to Shinkai',
    welcomeDescription:
      '<b>Shinkai lets you build AI agents in minutes — fast, private, and secure.</b> Run locally, collaborate through a decentralized network, and create AI workflows effortlessly. ',
    localAI: 'Shinkai Local AI',
    benefits: {
      local:
        '<b>Local:</b> With a local Shinkai, you gain complete control over your data in a secure environment.',
      privacy:
        '<b>Privacy-Focused:</b> Your data remains secure with offline capabilities and strong privacy protections.',
      tools:
        '<b>Tools for Everyday Tasks:</b> Supports 100+ integrations and counting.',
    },
    model: {
      installation: 'Installing {{modelName}}...',
      downloading: 'Downloading',
      embeddingBenefits: {
        efficient:
          '<b>Compact Size & Efficient:</b> With only 22 million parameters and a 384-dimensional embedding vector, the Arctic-embed-xs is designed to be resource-efficient.',
        highRetrieval:
          '<b>High Retrieval Performance:</b> It can effectively retrieve relevant information from large datasets, with high accuracy in search and retrieval tasks.',
        dataAnalysis:
          '<b>Improved Data Analysis:</b> Extract meaningful insights from unstructured data, improving decision-making processes and operational efficiency.',
      },
      gemmaBenefits: {
        performance:
          '<b>High Performance in a Compact Size:</b>The gemma2:2b model is designed to deliver class-leading performance while maintaining a relatively small size of 2 billion parameters. ',
        fast: '<b>Fast Execution:</b> Users have noted that it runs efficiently on mid-range hardware, enabling faster responses and smoother interactions without significant lag.',
        lightweight:
          '<b>Lightweight:</b>This lightweight nature means it requires less memory and computational power, making it accessible for a wider range of users and applications.',
      },
      ollamaBenefits: {
        resource:
          "<b>Efficient Resource Usage:</b> It's a light-weight, ultra-fast model compared to larger models.",
        language:
          '<b>Powerful Language Generation:</b> Generate human-like text across a variety of applications such as content generation, language translation, and coding assistance.',
        multilingual:
          '<b>Multilingual Support:</b> The model supports dialogues in multiple languages including English, Spanish, French, German and more',
      },
      commandr7bBenefits: {
        performance:
          '<b>High Performance in a Compact Size:</b> The command-r7b model is designed to deliver excellent performance while maintaining a relatively small size.',
        fast: '<b>Fast Execution:</b> Users have noted that it runs efficiently on mid-range hardware, enabling faster responses and smoother interactions without significant lag.',
        lightweight:
          '<b>Lightweight:</b> This lightweight nature means it requires less memory and computational power, making it accessible for a wider range of users and applications.',
      },
      mistralSmallBenefits: {
        resource:
          "<b>Efficient Resource Usage:</b> It's a light-weight, ultra-fast model compared to larger models.",
        language:
          '<b>Powerful Language Generation:</b> Generate human-like text across a variety of applications such as content generation, language translation, and coding assistance.',
        multilingual:
          '<b>Multilingual Support:</b> The model supports dialogues in multiple languages including English, Spanish, French, German and more',
      },
    },
  },
  layout: {
    sidebar: {
      toggle: 'Toggle Sidebar',
    },
    menuItems: {
      chats: 'Chats',
      aiTasks: 'AI Tasks',
      vectorFs: 'AI Files Explorer',
      vectorSearch: 'AI Files Content Search',
      agents: 'Agents',
      manageAis: 'Manage AIs',
      settings: 'Settings',
      disconnect: 'Disconnect',
      helpAndSupport: 'Help and Support',
      mcp: 'MCPs',
      tools: 'Tools',
      scheduledTasks: 'Scheduled Tasks',
      decentralizedAgents: 'Decentralized AI Agents',
    },
  },
  chatDM: {
    create: 'Create DM Chat',
    form: {
      shinkaiIdentity: 'Shinkai Identity',
      message: 'Message',
      messagePlaceholder: 'Enter your message',
    },
  },
  quickAsk: {
    emptyStateTitle: 'Ask Shinkai AI',
    emptyStateDescription:
      'Try "How to make a HTTP request in JavaScript" , "Give me the top 10 rock music in the 80s", "Explain me how internet works"',
  },
  chat: {
    chats: 'Chats',
    agents: 'Agents',
    emptyStateTitle: 'Ask Shinkai AI',
    emptyStateDescription:
      'For quick questions, press ⌘ + Shift + J to use Shinkai Spotlight',
    create: 'Create AI Chat',
    allMessagesLoaded: 'All previous messages have been loaded ✅',
    limitReachedTitle: 'Limit Reached',
    sendMessagePlaceholder: 'Send a message, or press "/" to access tools',
    limitReachedDescription:
      "You've used all of your queries for the month on this model/agent. Please start a new chat with another agent.",
    enterMessage: 'Enter Message',
    sendMessage: 'Send Message',
    openChatFolder: 'Open Chat Folder',
    failedToOpenChatFolder: 'Please upload a file to the chat first',
    form: {
      message: 'Tell us the job you want to do',
      messagePlaceholder: 'Eg: Explain me how internet works...',
      selectAI: 'Select your AI',
      setContext: 'Set Chat Context',
      setContextText:
        'Add files or folders for your AI to use as context during your conversation.',
      selectedText: 'Your selected text',
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
      archived: 'Archived',
      notFound: 'No archived conversations found.',
      success: 'Your conversation has been archived',
      error: 'Error archiving job',
    },
    editMessage: {
      warning: 'This will restart your conversation from here.',
    },
    fileProcessing: {
      title: 'Your file is being processed',
      description: 'It can take a few minutes',
    },
    actions: {
      deleteInbox: 'Delete Chat',
      deleteInboxConfirmationTitle: 'Delete chat?',
      deleteInboxConfirmationDescription:
        'The chat will be deleted and removed from your chat history',
    },
    tracing: {
      title: 'Tracing',
    },
  },
  aiFilesSearch: {
    label: 'AI Files Content Search',
    description:
      'Search to find content across all files in your AI Files easily',
    foundResults: 'Found {{count}} results',
    filesSelected: 'Selected {{count}} files',
  },
  vectorFs: {
    label: 'AI Files Explorer',
    localFiles: 'Local AI Files',
    allFiles: 'All Files',
    sharedFolders: 'Shared Folders',
    actions: {
      addNew: 'Add New',
      createFolder: 'Add New Folder',
      uploadFile: 'File Upload',
      createTextFile: 'Create Text File',
      editTextFile: 'Edit Text File',
      share: 'Share',
      unshare: 'Unshare',
      edit: 'Edit',
      move: 'Move',
      copy: 'Copy',
      delete: 'Delete',
      searchWithinFolder: 'Search within folder',
      uploadFileText:
        'Uploading your files transforms them to be AI-ready and available to use in Shinkai.',
      shareFolderText:
        'You can share folders that you store in AI Files with anyone.',
      unshareFolderText:
        "Everyone will be removed from this folder. You'll still keep a copy of this folder in your AI Files. <br /> Note: Removed members will keep a copy of this shared folder.",
    },
    forms: {
      folderName: 'Folder Name',
      folderDescription: 'Folder Description',
      textFileName: 'Title',
    },
    pending: {
      filesUploading: 'Uploading files',
    },
    success: {
      folderMoved: 'Folder moved successfully',
      folderDeleted: 'Folder has been deleted',
      folderCopied: 'Folder copied successfully',
      folderShared: 'Folder shared successfully',
      folderUnshared: 'Folder unshared successfully',
      folderCreated: 'Folder created successfully',
      filesUploaded: 'Files uploaded successfully',
      fileMoved: 'File moved successfully',
      fileDeleted: 'File has been deleted',
      fileCopied: 'File copied successfully',
    },
    errors: {
      folderMoved: 'Error moving folder',
      folderDeleted: 'Error deleting folder',
      folderCopied: 'Error copying folder',
      folderShared: 'Error sharing folder',
      folderUnshared: 'Error unsharing folder',
      folderCreated: 'Error creating folder',
      filesUploaded: 'Error uploading files',
      fileMoved: 'Error moving file',
      fileDeleted: 'Error deleting file',
      fileCopied: 'Error copying file',
    },
    home: 'Home',
    emptyState: {
      noFilesAndFolders: 'This will be the home for all your files.',
      noFilesAndFoldersDescription:
        'Use the "+" button to start uploading files.',
      noFiles: 'No files found',
      noSharedFolders: 'Your shared folders will be displayed here.',
    },
    filesSelected: '{{count}} selected',
    deleteFolderConfirmation:
      'Are you sure you want to delete this folder? This action cannot be undone.',
    deleteFileConfirmation:
      'Are you sure you want to delete this file? This action cannot be undone.',
    shareFolderWarning: {
      title: 'Enable Folder Sharing',
      text: 'You must register a Shinkai identity before you can share folders over the Shinkai Network.',
      action: 'Click Here to Learn How',
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
    unavailable: 'Your Shinkai Node is unavailable',
    notifications: {
      startingNode: 'Starting your local Shinkai Node',
      runningNode: 'Your local Shinkai Node is running',
      stoppedNode: 'Your local Shinkai Node was stopped',
      stopNode: 'Stopping your local Shinkai Node',
      removedNote: 'Your local Shinkai Node storage was removed',
      startingOllama: 'Starting your Ollama',
      runningOllama: 'Your Ollama is running',
      stoppedOllama: 'Your local Ollama was stopped',
      stopOllama: 'Stopping your local Ollama',
      syncedOllama: 'Local Ollama models synchronized with your Shinkai Node',
      errorSyncOllama:
        'Error synchronizing your local Ollama models with your Shinkai Node',
      optionsRestored: 'Options restored to default values',
      startingDownload: 'Starting downloading {{modelName}}',
      downloadingModel: 'Downloading AI model {{modelName}} - {{progress}}%',
      downloadedModel: 'AI model {{modelName}} downloaded successfully',
      installingModel: 'Installing {{modelName}} ...',
    },
    manager: 'Shinkai Node Manager',
    resetNodeWarning: {
      title: 'Unable to connect',
      description:
        'Your Shinkai Node is currently locked by existing keys. To connect again, you can reset all your Shinkai Node data.',
      option1:
        '<b>Restore:</b> Try to restore your connection using a backed up keys.',
      option2:
        '<b>Reset Data:</b> Permanently delete all your Shinkai Node data.',
      option3:
        '<b>Reset All:</b> Permanently delete all your Shinkai Node data including the encryption and signing keys.',
    },
    models: {
      labels: {
        models: 'Models',
        quality: 'Quality',
        tags: 'Tags',
        bookPages: 'Up to {{pages}} Pages of Content',
        showAll: 'Show all models',
        showRecommended: 'Show recommended models',
        visionCapability: 'Image To Text',
        textCapability: 'Text Generation',
      },
      success: {
        modelRemoved: 'Model {{modelName}} removed successfully',
        modelInstalled: 'Model {{modelName}} installed successfully',
      },
      errors: {
        modelRemoved: 'Error removing model {{modelName}}',
        modelInstalled: 'Error installing model {{modelName}}',
      },
      poweredByOllama: 'Powered by Ollama',
    },
  },
  onboardingChecklist: {
    getStartedText: 'Get Started with Shinkai',
    getStartedChecklist: 'Get started checklist',
    setupShinkaiDesktop: 'Setup Shinkai Desktop',
    setupShinkaiDesktopDescription: 'Setup Shinkai Desktop to get started',
    addAIAgent: 'Create your AI Agent',
    addAIAgentDescription:
      'Add a customized AI agent tailored to to your specific needs.',
    createAIChatWithAgent: 'Create Chat with AI Agent',
    createAIChatWithAgentDescription:
      'Start a conversation with your AI agent to get started.',
    uploadAFile: 'Upload a File',
    uploadAFileDescription:
      'Keep your notes, websites, docs and others securely stored in one place.',
    askFiles: 'Ask Questions to Files',
    askFilesDescription:
      'Chat with your files. Ask any questions, find information, get summaries and more.',
    askFilesButton: 'Create Chat with Files',
    dismiss: 'Dismiss Checklist',
    completedSteps: 'You have completed all steps',
    createTool: 'Create Tool',
    createToolDescription:
      'Create, automate, and optimize your workflow with powerful AI tools.',
    createToolButton: 'Create Tool',
  },
  settings: {
    label: 'Settings',
    description: 'Manage your account settings preferences.',
    defaultAgent: 'Default AI',
    layout: {
      general: 'General',
      appearance: 'Appearance',
      remoteAccess: 'Remote Access',
      shinkaiNode: 'Shinkai Node Manager',
      exportConnection: 'Export Connection',
      createRegistrationCode: 'Create Registration Code',
      analytics: 'Analytics',
      publicKeys: 'Public Keys',
      galxe: 'Galxe Quest',
      promptLibrary: 'Prompt Library',
      cryptoWallet: 'Crypto Wallet',
    },
    cryptoWallet: {
      title: 'Crypto Wallet',
      addCoinbaseCDPWallet: 'Add Coinbase CDP Wallet',
      addLocalWallet: 'Add Local Wallet',
      description:
        'Manage your crypto wallets. Add your Coinbase CDP Wallet or your Hot Wallet.',
      addWallet: 'Add Wallet',
      name: 'Name',
      privateKey: 'Private Key',
      walletId: 'Wallet ID',
      serverSigner: 'Server Signer',
      walletIdOptional: 'Wallet ID is optional',
      successTitle: 'Wallet restored successfully',
      successDescription: 'Your wallet has been restored successfully.',
      errorTitle: 'Error restoring wallet',
      errorDescription: 'There was an error restoring your wallet.',
      emptyState: {
        title: 'No wallets found',
        description:
          'Manage your crypto wallets. Create or restore your Wallet.',
      },
    },
    shinkaiIdentity: {
      label: 'Shinkai Identity',
      updatedIdentity: 'Shinkai Identity updated successfully.',
      registerIdentity: 'Register your Shinkai Identity',
      troubleRegisterIdentity: 'Trouble registering your Identity?',
      saveWillRestartApp: 'Save will restart the App to apply changes',
      goToShinkaiIdentity: 'Go to My Shinkai Identity',
      success: 'Shinkai Identity updated successfully',
      error: 'Error updating Shinkai Identity',
      checkIdentityInSync: 'Verify Shinkai Identity',
      checkIdentityInSyncDescription:
        'Check that your shinkai identity are accurately in sync.',
    },
    general: 'General',
    sidebar: {
      label: 'Sidebar',
      blacklistedWebsites: 'Blacklisted Websites',
      includeClickSummary: {
        title: 'Include 1-Click Summary Option',
        text: 'Adds a Summary Button to the Quick Access hover menu.',
      },
      includeClickImageCapture: {
        title: 'Include 1-Click Image Capture Option',
        text: 'Adds an Image Capture Button to the Quick Access hover menu.',
      },
    },
    quickAccessButton: {
      label: 'Show Shinkai Quick Access Button',
      description:
        'The Quick Access Button can be moved by clicking and holding.',
    },
    experimentalFeature: {
      label: 'Enable Experimental Features',
    },
    maxChatIterations: {
      label: 'Max Chat Iterations',
      description:
        'The maximum number of iterations for a chat message to process',
      placeholder: 'Enter a number between 1 and 100',
      success: 'Max Chat Iterations updated successfully',
      error: 'Error updating Max Chat Iterations',
    },
    language: {
      label: 'Language',
      selectLanguage: 'Select Language',
    },
    shinkaiVersion: 'Shinkai Desktop Version:',
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
    publicKeys: {
      label: 'Public Keys',
      show: 'Show Public Keys',
      nodePublicKeys: 'Node Public Keys',
      profilePublicKeys: 'Profile Public Keys',
      myDevicePublicKeys: 'My Device Public Keys',
      nodeEncryption: 'Node Encryption',
      nodeSignature: 'Node Signature',
      profileEncryption: 'Profile Encryption',
      profileIdentity: 'Profile Identity',
      myDeviceEncryption: 'My Device Encryption',
      myDeviceIdentity: 'My Device Identity',
    },
    promptLibrary: {
      label: 'Prompt Library',
    },
    appearance: {
      label: 'Appearance',
      chatFontSize: {
        title: 'Chat Font Size',
        description: 'Select your preferred font size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        extraLarge: 'Extra Large',
      },
    },
    remoteAccess: {
      title: 'Remote Access',
      description:
        'Easily and securely connect to your Shinkai node from anywhere using ngrok. No complex setup—just  <a>create a free ngrok account</a>, copy your <b>ngrok auth token</b> from the dashboard, and paste it below to enable secure remote access.',
      connected: 'Connected',
      publicAccessUrl: 'Public Access URL',
      publicAccessURLDescription:
        'Use this URL to connect to your node from anywhere.',
      form: {
        authToken: 'Ngrok Auth Token',
        authTokenHelperText: 'Enter your ngrok auth token',
        authTokenHelperTextWhenEnabled:
          'Stop remote access to ngrok to update your auth token',
        enableRemoteAccess: 'Enable Remote Access',
        stopRemoteAccess: 'Stop Remote Access',
      },
      success:
        'Connected! Your Shinkai node is now accessible remotely via ngrok',
      stopRemoteAccessSuccess: 'Remote access has been stopped successfully',
      errors: {
        failedToStart: 'Failed to connect remote access via ngrok.',
        failedToStop: 'Failed to disconnect remote access via ngrok.',
        failedToGetStatus: 'Failed to get ngrok status.',
      },
    },
  },
  exportConnection: {
    label: 'Export Connection',
    generateFile: 'Generate connection file',
    downloadText: 'Download and keep this connection file in a safe place',
    restoreText:
      'Use it with your passphrase to restore the connection to your Shinkai Node',
    form: {
      passphrase: 'Passphrase',
      repeatPassphrase: 'Repeat Passphrase',
    },
  },
  restoreConnection: {
    label: 'Restore Connection',
    restore: 'Restore',
    description: 'Use a connection file and passphrase',
    form: {
      encryptedConnectionFile: 'Encrypted Connection File',
      passphrase: 'Passphrase',
    },
  },
  registrationCode: {
    label: 'Registration Code',
    create: 'Create Registration Code',
  },
  common: {
    search: 'Search',
    noResultsFound: 'No results found.',
    adding: 'Adding...',
    updating: 'Updating...',
    details: 'Details',
    added: 'Added',
    more: 'More',
    next: 'Next',
    clear: 'Clear',
    enabled: 'Enabled',
    disabled: 'Disabled',
    configure: 'Configure',
    create: 'Create',
    restore: 'Restore',
    retry: 'Retry',
    copy: 'Copy',
    resetData: 'Reset Data',
    resetAll: 'Reset All',
    clickToUpload: 'Click to upload or drag and drop',
    upload: 'Upload',
    clearSearch: 'Clear Search',
    searchPlaceholder: 'Search...',
    howWouldYouLikeToProceed: 'How would you like to proceed?',
    uploadFile: 'Upload a File',
    uploadAFileDescription:
      'Supports Images, PDF, CSV, TXT, XLSX and more formats',
    folders: 'Folders',
    folderWithCount_one: '{{count}} Folder',
    folderWithCount_other: '{{count}} Folders',
    files: 'Files',
    file: 'File',
    fileWithCount_one: '{{count}} File',
    fileWithCount_other: '{{count}} Files',
    save: 'Save',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    continue: 'Continue',
    connect: 'Connect',
    rename: 'Rename',
    disconnect: 'Disconnect',
    soon: 'soon',
    back: 'Back',
    edit: 'Edit',
    send: 'Send',
    editMessage: 'Edit Message',
    delete: 'Delete',
    update: 'Update',
    moreOptions: 'More Options',
    comingSoon: 'Coming soon - Late August',
    noThanks: 'No, Thanks',
    iAgree: 'I Agree',
    getStarted: 'Get Started Free',
    passphrase: 'Passphrase',
    repeatPassphrase: 'Confirm passphrase',
    optIn: 'Opt In',
    optOut: 'Opt Out',
    logInShinkaiHosting: 'Log In To Shinkai Hosting',
    signUpShinkaiHosting: 'Sign up For Shinkai Hosting',
    quickConnect: 'Quick Connect',
    alreadyHaveNode: 'Already have a Node?',
    shinkaiPrivate: 'Setup Your Local AI',
    seeOptions: 'See Options',
    termsAndConditionsText:
      'I agree to the <a>Terms of Service</a> and <b>Privacy Policy</b>',
    recommended: 'Recommended',
    remove: 'Remove',
    install: 'Install',
    unselectAll: 'Unselect All',
    done: 'Done',
    resetFilters: 'Reset Filters',
    folderLocation: 'Folder Location:',
    installed: 'Installed',
    deleteTool: 'Delete Tool',
    tryItOut: 'Try It Out',
    showMore: 'More',
    showLess: 'Show Less',
    viewDetails: 'View Details',
    selectItem: 'Select an item to view details',
    about: 'About',
    refresh: 'Refresh',
    tryAgain: 'Try again',
    none: 'None',
    advanced: 'Advanced',
    all: 'All',
    agent: 'Agent',
    tool: 'Tool',
    add: 'Add',
  },
  quickConnection: {
    label: 'Quick Connection',
    form: {
      nodeAddress: 'Node Address',
      connect: 'Connect',
    },
    connectingToNode: 'Connecting to your local Shinkai Node',
  },
  analytics: {
    label: 'Analytics',
    title: 'Help us improve Shinkai',
    bulletPoints: {
      one: '<check/> Always allow you to opt-out via Settings',
      two: '<check/> Randomized Analytics',
      three:
        '<check/> Send analytical information about what features you use but without any content or responses',
      four: '<x/> Never collect your IP address',
      five: '<x/> Never collect your AI queries',
      six: '<x/> Never use personal information for training purposes',
    },
    moreInfo:
      'Fore more information in relation to our privacy practices, please see our <a>Privacy Policy</a>',
  },
  llmProviders: {
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
      generatedId: 'Generated ID',
      name: 'AI Name',
      externalUrl: 'External URL',
      apiKey: 'API Key',
      modelName: 'Model Name',
      modelProvider: 'Model Provider',
      modelId: 'Model ID',
      modelType: 'Model',
      customModelType: 'Custom Model Type',
      toggleCustomModel: 'Add a custom model',
      selectModel: 'Select Model Provider',
      description: 'Description',
      descriptionHelper:
        'Brief description (optional) to help identify this AI later',
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
  tasks: {
    runNow: 'Run Now',
  },
  ollama: {
    version: 'Ollama Version',
    errors: {
      failedToFetch:
        'Failed to fetch local Ollama models. Please ensure Ollama is running correctly.',
    },
  },
  galxe: {
    label: 'Galxe Quest',
    goToGalxeQuest: 'Check our Galxe Quest',
    form: {
      evmAddress: 'EVM Address',
      evmAddressHelper: 'Add the EVM Address you are using in Galxe',
      signature: 'Signature',
      proof: 'Proof',
      registerInstallation: 'Register Installation',
    },
    success: {
      registerDesktopInstallation:
        'Your Shinkai Desktop installation was registered successfully. It may take some hours to be registered in Galxe quest.',
    },
    errors: {
      registerDesktopInstallation:
        'Error registering your Shinkai Desktop installation. Please ensure your EVM Address was not used previously to register a different installation.',
    },
  },
  mcpServers: {
    label: 'MCP Servers',
    add: 'Add MCP Server',
    name: 'Name',
    type: 'Type',
    namePlaceholder: 'My MCP Server',
    selectServerType: 'Select server type',
    environmentVariables: 'Environment Variables',
    addVariable: 'Add',
    noEnvironmentVariablesAdded: 'No environment variables added.',
    update: 'Update MCP Server',
    delete: 'Delete Server',
    configure: 'Configure Server',
    updateWarningDescription:
      'Updating this server will reset its associated tools.',
    updateDescription: 'Updating configuration for MCP server: {{name}}',
    statusUpdated: 'Status updated successfully',
    statusUpdateFailed: 'Failed to update status',
    deleteDescription:
      'Are you sure you want to delete the server "{{name}}"? This action cannot be undone.',
    deleteSuccess: 'MCP server deleted successfully',
    deleteFailed: 'Failed to delete MCP server',
    addSuccess: 'MCP server added successfully',
    addFailed: 'Failed to add MCP server',
    addDescription:
      'Configure a new MCP server to connect with your Shinkai Node',
    updateSuccess: 'MCP server updated successfully',
    updateFailed: 'Failed to update MCP server',
    toolMustBeEnabled: 'Tool must be enabled before changing MCP server mode',
    tooltipEnableFirst: 'Enable tool first to manage MCP Server mode',
    manualSetup: 'Manual Setup',
    addFromGitHub: 'Add from GitHub',
    tools: 'Tools',
    toolsFor: 'Tools for {{name}}',
    listOfToolsAvailableFromThisMcpServer:
      'List of tools available from this MCP server.',
    viewAvailableTools: 'View Available Tools',
    noToolsAvailableForThisServer: 'No tools available for this server.',
    noServersFound: 'No MCP servers found. Add a new server to get started.',
    title: 'MCP Servers',
    listDescription: 'List of MCP servers connected to your Shinkai Node',
    composio: {
      title: 'Composio MCP Servers',
      details: 'Details',
      created: 'Created',
      lastUpdated: 'Last Updated',
      categories: 'Categories',
      toolsCount: 'Tools Count',
      availableActions: 'Available Actions',
      statistics: 'Statistics',
      totalDownloads: 'Total Downloads',
      activeUsers: 'Active Users',
      latestVersion: 'Latest Version',
      updatedAt: 'Last Updated',
      installing: 'Installing...',
      uninstalling: 'Uninstalling...',
      adding: 'Adding...',
      deleting: 'Deleting...',
      install: 'Install',
      uninstall: 'Uninstall',
      add: 'Add MCP Server',
      delete: 'Delete',
      loginRequired: 'You must be logged in to install apps',
      installSuccess: '{{appName}} installed successfully',
      installFailed: 'Error installing app from composio',
      uninstallSuccess: '{{appName}} uninstalled successfully',
      uninstallFailed: 'Error uninstalling app from composio',
    },
  },
  tools: {
    label: 'Tools',
    newTool: 'New Tool',
    create: {
      title: 'Build AI Tools in Minutes',
      description:
        'Create, automate, and optimize your workflow with powerful AI tools.',
      step1Label: 'Step 1',
      step1Text: 'Select your model',
      step2Label: 'Step 2',
      step2Text: 'Write your requirements',
      messagePlaceholder: 'Describe the tool you want to create...',
      generationError:
        'Failed to generate tool. You might want to try using a more powerful AI model for better results.',
      wellSupportedProtocols: 'Well Supported Protocols',
      verifiedProtocolsTitle: 'Verified Protocols',
      noProtocols: 'No protocols found .',
      otherProtocols:
        "Other protocols may also work but haven't been officially verified.",
      requestProtocol: 'Request Protocol',
    },
    description: 'Manage, customize, and expand your AI tools.',
    emptyState: {
      search: {
        text: 'No tools found for the search query',
      },
    },
    searchPlaceholder: 'Search tools...',
    commandEmpty: 'No tools found.',
    commandActiveHeading: 'Your Active Tools',
    noToolsInCategory:
      'No tools found in this category. Create a new tool or install from the App Store.',
    store: {
      label: 'Explore AI Store',
    },
    importModal: {
      title: 'Import Tool',
      fromUrl: 'Import from URL',
      fromZip: 'Import from Zip',
      urlDescription: 'Import a tool from a URL.',
      zipDescription: 'Import a tool from a zip file.',
      chooseFile: 'Choose a zip file',
      action: 'Import',
    },
    successDuplicateTool: 'Tool duplicated successfully',
    errorDuplicateTool: 'Failed to duplicate tool',
    successOpenToolInCodeEditor: 'Tool opened in code editor successfully',
    errorOpenToolInCodeEditor: 'Failed to open tool in code editor',
    commonToolsetAffectedTools:
      'Choosing to update all tools in the set will also affect:',
    commonToolsetUpdateDescription:
      'The configuration key you are changing for {{toolName}} is also used by other tools in this set.',
    configuration: {
      updateConfig: 'Update {{toolName}} Configuration',
      updateConfigDescription:
        'The configuration key you are changing for {{toolName}} is also used by other tools in this set.',
      updateConfigDescription2:
        'This configuration is shared by multiple {{toolSetName}} tools. How would you like to apply this change?',
      followingToolsAffected:
        'The following tools will be affected by this change:',
      updateOnlyThisTool: 'Update only this tool',
      updateAllToolsInSet: 'Update all {{toolSetName}} tools',
      updateAllToolsInSetSuccess:
        'All {{toolSetName}} tools have been updated successfully',
      updateAllToolsInSetError: 'Failed to update all {{toolSetName}} tools. ',
    },
    installFromStore: 'Install from Store',
    lookingForMoreTools: 'Looking for more tools?',
    visitStore:
      'Visit the Shinkai Store to discover and install additional tools to enhance your workflow',
    setupRequired: 'Tool Setup Required',
    configurationRequired: "Tool's Configuration Required",
    setupDescription:
      'To use this feature, we need to configure some settings first. This will only take a minute and helps ensure everything works smoothly.',
    setupNow: 'Set Up Now',
    notifications: {
      feedbackRequired: {
        title: 'Feedback Required',
        description: 'Please provide feedback on the generated code.',
      },
      codeGenerationComplete: {
        title: 'Code Generation Complete',
        description: 'The code has been generated successfully.',
      },
      metadataGenerationComplete: {
        title: 'Metadata Generation Complete',
        description: 'The metadata has been generated successfully.',
      },
    },
    homepage: {
      buildTitle: 'Build AI Tools in Minutes',
      buildDescription:
        'Create, automate, and optimize your workflow with powerful AI tools.',
      step1Label: 'Step 1',
      step1Text: 'Select your model',
      step2Label: 'Step 2',
      step2Text: 'Write your requirements',
      createInIDE: 'Create in VSCode/Cursor',
      messagePlaceholder: 'Describe the tool you want to create...',
      generationError:
        'Failed to generate tool. You might want to try using a more powerful AI model for better results.',
      discoverMoreTitle: 'Discover More Tools',
      discoverMoreDescription:
        'Explore and install tools from our App Store to boost your productivity and automate your workflow.',
      wellSupportedProtocols: 'Well Supported Protocols',
      verifiedProtocolsTitle: 'Verified Protocols',
      noProtocols: 'No protocols found .',
      otherProtocols:
        "Other protocols may also work but haven't been officially verified.",
      requestProtocol: 'Request Protocol',
      shiftEnter: 'for a new line',
      enterToSend: 'to send',
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
  codeRunner: {
    errorOccurred: 'Error Occurred',
    stderr: 'Standard Error',
    stdout: 'Standard Output',
    output: 'Output',
    executeCode: 'Execute Code',
  },
  oauth: {
    title: 'Connect to {{provider}}',
    description: 'Connect to {{provider}} to use this tool',
    signIn: 'Sign in with {{provider}}',
    success: 'Connection successful!',
    successDescription:
      'This window will close automatically in {{countdown}} seconds...',
    navigateToProvider:
      'Navigate and follow the authentication steps to continue.',
    processing: 'Processing...',
    goToProvider: 'Go to {{provider}}',
    close: 'Close',
    connectionRequired: 'Connection Required',
    connectionRequiredDescription:
      'To use this tool, please connect your {{provider}} account.',
    connectNow: 'Connect Now',
  },
  mcpClients: {
    configFailTitle: 'Automatic {{clientName}} Configuration Failed',
    configFailDescription:
      '{{errorMessage}} Please follow the instructions below for manual setup:',
    copyJsonSuccess: 'JSON configuration copied to clipboard',
    copyJsonButton: 'Copy JSON Config',
    claudeLoading: 'Attempting automatic Claude Desktop configuration...',
    claudeSuccessTitle: 'Claude Desktop configured successfully!',
    claudeSuccessDescription:
      'Please restart Claude for the changes to take effect.',
    claudeFailMessageBase: 'Automatic Claude configuration failed.',
    cursorLoading: 'Attempting automatic Cursor configuration...',
    cursorSuccessTitle: 'Cursor configured successfully!',
    cursorSuccessDescription:
      'Please restart Cursor for the changes to take effect.',
    cursorFailMessageBase: 'Automatic Cursor configuration failed.',
    customTitle: 'Custom External Client Configuration',
    customDescriptionPrimary:
      'The recommended way to connect your external client is via Server-Sent Events (SSE).',
    customDescriptionSecondary:
      'If your client does not support SSE, you can run the Shinkai MCP server as a separate process using this command:',
    customCopySseUrlButton: 'Copy SSE URL',
    customCopyCommandButton: 'Copy Command',
    copySuccessUrl: 'SSE URL copied to clipboard',
    copySuccessCommand: 'Command copied to clipboard',
    connectExternalClient: 'Connect External MCP Client',
  },
  feedback: {
    button: 'Feedback',
    description:
      'We value your feedback! Please let us know your thoughts about Shinkai and how we can improve your experience.',
    title: 'Share Feedback',
    form: {
      contactLabel: 'Email or phone number',
      contactPlaceholder: 'Email or phone number',
      contactHelp: 'How can we reach you if we have questions?',
      feedbackLabel: 'Your Feedback',
      feedbackPlaceholder:
        'Please share your thoughts, suggestions, or questions...',
      submit: 'Send Feedback',
      success: 'Thank you for your feedback! We will get back to you soon.',
      error: 'Failed to submit feedback. Please try again.',
    },
  },
  agents: {
    label: 'Agents',
    explore: 'Explore',
    myAgents: 'My Agents',
    configureAgent: 'Configure Agent',
    createFirstAgent:
      'Create your first Agent to start exploring the power of AI.',
    noAvailableAgents: 'No available agents',
    systemInstructions: 'System Instructions',
    chatWithAgent: 'Chat with Agent',
    form: {
      newChat: 'New Chat',
      chatHistory: 'Chat History',
      closeChat: 'Close Chat',
      emptyChatTitle: 'Chat with your Agent',
      emptyChatDescription: 'Send a message to start chatting with this agent',
      enter: 'Enter',
      enterToSend: 'to send',
      messagePlaceholder: 'Send message...',
      updateAgent: 'Update Agent',
      createAgent: 'Create New Agent',
      newAgent: 'New Agent',
      openChat: 'Open Chat',
    },
    create: {
      persona: 'Persona',
      knowledge: 'Knowledge',
      tools: 'Tools',
      schedule: 'Schedule',
      agentName: 'Agent Name',
      agentNameHelperEdit:
        'You can change the agent name, but the agent ID remains unchanged. Agent ID: {{agentName}}',
      agentNameHelperCreate:
        'Enter a unique name for your AI agent. This will also be used as the agent ID {{agentName}}',
      description: 'Description',
      descriptionPlaceholder:
        'e.g., Create user-centered designs and improve user interactions.',
      descriptionHelper:
        'Briefly describe your agent’s purpose (not used by the agent).',
      systemInstructions: 'System Instructions',
      systemInstructionsPlaceholder:
        'e.g., You are a helpful assistant that can answer questions and help with tasks.',
      systemInstructionsHelper:
        'Control your agents behavior by adding custom instructions',
      llmProviderLabel: 'Select AI',
      llmProviderDescription: 'Choose the model that will power your agent',
      contextSettingsLabel: 'Context Settings',
      messageContextLabel: 'Message Context',
      messageContextDescription:
        '(Optional) You can control the message context here by forcing a static message with the user message e.g. {{user_message}}. And then say: Chao amigo!. This will add "And then say: Chao amigo!" to every message sent.',
      advanceOptionsLabel: 'Advanced Options',
      enableStream: 'Enable Stream',
      enableStreamDescription: "Streams the agent's response as it generates",
      enableTools: 'Enable Tools',
      enableToolsDescription:
        'Allows the agent to use tools to complete tasks.',
      temperature: 'Temperature',
      temperatureDescription:
        'Temperature is a parameter that affects the randomness of AI outputs. Higher temp = more unexpected, lower temp = more predictable.',
      topP: 'Top P',
      topPDescription:
        'Adjust the probability threshold to increase the relevance of results. For example, a threshold of 0.9 could be optimal for targeted, specific applications, whereas a threshold of 0.95 or 0.97 might be preferred for tasks that require broader, more creative responses.',
      topK: 'Top K',
      topKDescription:
        'Adjust the count of key words for creating sequences. This parameter governs the extent of the generated passage, forestalling too much repetition. Selecting a higher figure yields longer narratives, whereas a smaller figure keeps the text brief.',
      knowledgeBase: 'Knowledge Base',
      knowledgeBaseDescription:
        'Provide your agent with local AI files to enhance its knowledge and capabilities.',
      knowledgeSearch: 'Search folders and files ...',
      knowledgeAddNewFiles: 'Add New Files',
      toolsDescription:
        'Select which tools & skills your agent can use to complete tasks.',
      toolsCreateNewTool: 'Create New',
      selectedTools: 'Selected Tools',
      overrideConfigurations: 'Override Configurations',
      scheduleDescription: 'Set when your agent will automatically run tasks.',
      scheduleNormalUsage: 'Normal Usage',
      scheduleNormalUsageDescription:
        'Agent is ready to respond immediately when used upon in a chat.',
      scheduleRecurring: 'Normal Usage + Scheduled Execution',
      scheduleRecurringDescription:
        'Normal usage and also configure specific times and frequencies for agent tasks e.g. Twitter Agent that performs a workflow like checking and answering messages every 5 minutes.',
      scheduleAIInstructions: 'AI Instructions',
      scheduleAIInstructionsDescription:
        'Enter AI instructions for the scheduled execution...',
      scheduleAIInstructionsHelper:
        'Write the prompt that will be used for the scheduled execution.',
      cronExpression: 'Cron Expression',
      cronExpressionHelper:
        'Enter a cron expression eg: */30 * * * * (every 30 min)',
      saveAndTestAgent: 'Save & Test Agent',
    },
    importModal: {
      title: 'Import Agent',
      chooseFile: 'Choose a zip file',
      action: 'Import',
    },
    publishDialog: {
      open: 'Publish Agent',
      title: 'Publish {{name}}',
      paymentAddress: 'Payment Address',
      asset: 'Asset',
      amount: 'Amount',
      description: 'Description',
      selectAgent: 'Select Agent',
      searchAgents: 'Search agents',
      publish: 'Publish',
      published: 'Published',
    },
  },
  agentsPage: {
    description:
      'Create and explore AI agents with personalized instructions, enriched knowledge, <br /> diverse task capabilities, and more to tackle your goals autonomously.',
    exploreDescription:
      'Discover and install AI agents from the community to enhance your workflow <br /> and supercharge your productivity and creativity.',
    notFoundTitle: 'No available agents',
    notFoundDescription:
      'Create your first Agent to start exploring the power of AI.',
    addAgent: 'Add Agent',
    goToTaskDetails: 'Go to task details',
    exploreAgentsDescription: 'Explore custom AI agents for your needs',
  },
  aisPage: {
    label: 'AI Models',
    shortDescription: 'Explore a wide range of AI models',
    description:
      'Easily manage both cloud and local AI models, <br /> switching between them seamlessly to fit your workflow.',
  },
  tasksPage: {
    noTasksTitle: 'No scheduled tasks found',
    noTasksDescription:
      'Create your first scheduled task to automate reminders, summaries, or any other tasks you need to manage',
  },
  networkAgentsPage: {
    titleNetwork: 'Network',
    titleDecentralized: 'Decentralized Agents',
    agentsTab: 'Agents',
    publishedTab: 'Published Agents',
    manageWallet: 'Manage Wallet',
    walletBalance: 'Wallet Balance',
    descriptionNetwork:
      'Discover and deploy AI agents from the global network. Each agent operates autonomously and can be integrated into your workflows. Pay per use or deploy agents for others to access.',
    descriptionPublished:
      'Publish your AI agents to the network. Each agent operates autonomously and can be integrated into your workflows. Pay per use or deploy agents for others to access.',
    searchPlaceholder: 'Search for agents',
    toolRouterKey: 'Tool Router Key',
    addAgent: 'Add Agent',
    addedSuccess: 'Added Successfully!',
    addedDescription:
      '{{name}} is now in your collection. Start a chat to use it!',
    browseMore: 'Browse More Agents',
    startChat: 'Start Chat',
    setupRequired: 'Setup required to use paid agents',
    removeSuccess: 'Network agent removed successfully',
    removeFailed: 'Failed to remove agent',
    registerShinkaiIdentity: 'Register Shinkai Identity',
    registerShinkaiIdentityDescription:
      'Create your unique identity on the Shinkai network to use and publish agents',
    registerIdentity: 'Register Identity',
    connectWallet: 'Connect Wallet',
    connectWalletDescription:
      'Connect your wallet to pay for agent usage and receive earnings from your published agents',
    payPerUse: 'Pay per use',
    costPerUse: 'Cost per use',
    costPerUseDescription: 'Pay each time you use this agent',
    howPaymentsWork: 'How payments work',
    howPaymentsWorkDescription:
      "When you use this agent, you'll be prompted to confirm the payment from your connected wallet. Payments are processed on the {{network}} network.",
  },
  mcpPage: {
    exposeToolsTab: 'Expose Tools',
    mcpServersDescription:
      "Connect to an MCP server to instantly tap into external data sources and tools—like live weather updates, stock prices, or translation services—without building custom integrations.\nThis expands your system's capabilities with real-time information and easy access to new resources as your needs grow.",
    exposeToolsDescription:
      'Expose your AI Tools through MCP to enable seamless integration with other MCP Clients \nand expand their capabilities.',
    helpfulLinks:
      'You can find helpful MCPs to connect with Shinkai at smithery.ai and composio.dev.',
  },
  errorBoundary: {
    genericError: 'Something went wrong. Try refreshing the app.',
  },
  videoBanner: {
    unsupported: 'Your browser does not support the video tag.',
  },
  appReset: {
    title: 'App Reset Required',
    description:
      "We're currently in beta and we made some significant updates to improve your experience. To apply these updates, we need to reset your data. If you need assistance, please contact our support team.",
    action: 'Reset App',
  },
  playgroundTool: {
    metadataError: 'Tool metadata failed. Try generating again.',
    prismError: 'The code editor encountered an error.',
  },
  prompt: {
    libraryTitle: 'Prompt Library',
    libraryDescription: 'Choose a prompt from the library to get started.',
    drawer: {
      createTitle: 'Create custom prompt',
      updateTitle: 'Update Prompt',
    },
    fields: {
      name: 'Prompt Name',
      content: 'Prompt Content',
    },
    actions: {
      create: 'Create Prompt',
      update: 'Update Prompt',
    },
    successCreate: 'Prompt created successfully',
    failCreate: 'Failed to create prompt',
    successUpdate: 'Prompt updated successfully',
    failUpdate: 'Failed to update prompt',
  },
  cronTask: {
    taskDescription: 'Task Description',
    taskDescriptionHelper:
      "Briefly describe your agent's purpose (not used by the agent).",
    taskPrompt: 'Task Prompt',
    promptPlaceholder: 'e.g. Give me top hacker news stories',
    promptExample: 'e.g. Give me top hacker news stories',
    cronExpression: 'Cron Expression',
    cronExample: 'Enter a cron expression eg: */30 * * * * (every 30 min)',
    cronWillRun: 'This cron will run {{schedule}} ({{expression}})',
    scheduleOptions: {
      every5Min: 'every 5 min',
      every5Hours: 'every 5 hours',
      everyMonday8am: 'every monday at 8am',
      everyJanuary1st12am: 'every january 1st at 12am',
      every1stMonth12pm: 'every 1st of the month at 12pm',
    },
    aiModelConfiguration: 'AI Model Configuration',
    aiAgent: 'AI / Agent',
    forceToolUsage: 'Force Tool Usage (Optional)',
    enableStream: 'Enable Stream',
    enableTools: 'Enable Tools',
    temperature: 'Temperature',
    temperatureInfo:
      'Temperature is a parameter that affects the randomness of AI outputs. Higher temp = more unexpected, lower temp = more predictable.',
    topP: 'Top P',
    topPInfo:
      'Adjust the probability threshold to increase the relevance of results. For example, a threshold of 0.9 could be optimal for targeted, specific applications, whereas a threshold of 0.95 or 0.97 might be preferred for tasks that require broader, more creative responses.',
    topK: 'Top K',
    topKInfo:
      'Adjust the count of key words for creating sequences. This parameter governs the extent of the generated passage, forestalling too much repetition. Selecting a higher figure yields longer narratives, whereas a smaller figure keeps the text brief.',
  },
  dockerStatus: {
    dockerNotInstalled: 'Docker Not Installed',
    dockerInstalledButNotRunning: 'Docker Installed but Not Running',
    dockerRunning: 'Docker Running & Active',
    dockerNotInstalledDescription:
      'Docker is not installed on your system. Installing it will unlock better performance, faster processing, and an improved AI tool experience.',
    dockerInstalledButNotRunningDescription:
      'Docker is installed but not running. Start it now to improve tool execution speed, stability, and overall performance.',
    dockerRunningDescription:
      'Your tools are now running at full efficiency with Docker. Enjoy a smoother experience!',
  },
};
