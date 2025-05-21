import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router';

import { useSettings } from '../store/settings';

const useAppHotkeys = () => {
  const navigate = useNavigate();
  const isChatSidebarCollapsed = useSettings(
    (state) => state.isChatSidebarCollapsed,
  );
  const setChatSidebarCollapsed = useSettings(
    (state) => state.setChatSidebarCollapsed,
  );

  useHotkeys(
    ['mod+b', 'ctrl+b'],
    () => {
      setChatSidebarCollapsed(!isChatSidebarCollapsed);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      enableOnFormTags: true,
    },
  );

  useHotkeys(
    ['mod+n', 'ctrl+n'],
    () => {
      navigate('/home');
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
  );
};

export default useAppHotkeys;
