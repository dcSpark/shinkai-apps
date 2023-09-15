import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, useHistory } from 'react-router-dom';

import { Inbox } from '../../inbox/inbox';
import { RootState } from '../../store';
import { WithNav } from '../../with-nav/with-nav';
import { AddNode } from '../add-node/add-node';
import { CreateInbox } from '../create-inbox/create-inbox';
import { Inboxes } from '../inboxes/inboxes';
import { NotFound } from '../not-found/not-found';
import { SplashScreen } from '../splash-screen/splash-screen';
import Welcome from '../welcome/welcome';

export const PopupRouting = () => {
  const history = useHistory();
  const authStatus = useSelector((state: RootState) => state?.auth?.status);
  useEffect(() => {
    if (authStatus === 'authenticated') {
      history.replace('/inboxes');
      return;
    } else if (authStatus === 'unauthenticated') {
      history.replace('/welcome');
    }
  }, [authStatus, history]);

  return (
    <div className="h-full flex flex-col p-5">
      <Switch>
        <Route exact path="/">
          <SplashScreen></SplashScreen>
        </Route>
        <Route path="/welcome">
          <Welcome />
        </Route>
        <WithNav>
          <Route path="/nodes">
            <Switch>
              <Route path="/nodes/add">
                <AddNode></AddNode>
              </Route>
            </Switch>
          </Route>
          <Route path="/inboxes">
            <Switch>
              <Route path="/inboxes/create">
                <CreateInbox></CreateInbox>
              </Route>
              <Route path="/inboxes/:inboxId">
                <Inbox></Inbox>
              </Route>
              <Route path="/">
                <Inboxes></Inboxes>
              </Route>
            </Switch>
          </Route>
        </WithNav>
        <Route path="*">
          <NotFound></NotFound>
        </Route>
      </Switch>
    </div>
  );
};
