import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';

import { useSettings } from '../store/settings';

const useAppHotkeys = () => {
  const isChatSidebarCollapsed = useSettings(
    (state) => state.isChatSidebarCollapsed,
  );
  const setChatSidebarCollapsed = useSettings(
    (state) => state.setChatSidebarCollapsed,
  );

  const navigate = useNavigate();

  useHotkeys(
    ['mod+b', 'ctrl+b'],
    () => {
      setChatSidebarCollapsed(!isChatSidebarCollapsed);
    },
    { enableOnContentEditable: true, preventDefault: true },
  );

  useHotkeys(
    ['mod+n', 'ctrl+n'],
    () => {
      navigate('/inboxes');
    },
    { enableOnContentEditable: true, preventDefault: true },
  );
};

export default useAppHotkeys;
