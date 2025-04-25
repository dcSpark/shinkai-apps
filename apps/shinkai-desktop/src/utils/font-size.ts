import { useSettings } from '../store/settings';

export function useChatFontSize() {
  const chatFontSize = useSettings((state) => state.chatFontSize);
  
  const getMessageFontClass = () => {
    switch (chatFontSize) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-xs';
    }
  };
  
  const getSecondaryFontClass = () => {
    switch (chatFontSize) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-xs';
      case 'base':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-xs';
    }
  };
  
  return { getMessageFontClass, getSecondaryFontClass };
}
