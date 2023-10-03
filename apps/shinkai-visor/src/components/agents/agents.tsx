import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState, useTypedDispatch } from '../../store';
import { getAgents } from '../../store/agents/agents-actions';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export const Agents = () => {
  const dispatch = useTypedDispatch();
  const agents = useSelector((state: RootState) => state.agents?.agents?.data);
  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between">
      <ScrollArea>
        {agents?.map((agent) => (
          <div key={agent.id}>
            <div
              className="text-ellipsis overflow-hidden whitespace-nowrap"
            >
              {agent.id}
            </div>
            <Separator className="my-2" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
