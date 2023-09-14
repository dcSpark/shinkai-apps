import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { LocationDescriptor } from 'history';
import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
  useHistory,
} from 'react-router-dom';

import { langMessages, locale } from '../../lang/intl';
import { useSelectorSw } from '../../service-worker/service-worker-store';
import { antdTheme } from '../../theme/antd-theme';
import { AddNode } from '../add-node/add-node';
import { Inboxes } from '../inboxes/inboxes';
import NavBar from '../nav/nav';
import Welcome from '../welcome/welcome';

export const PopupApp = () => {
  const status = useSelectorSw(state => state?.node?.status);
  const history = useHistory();
  const redirect = (): LocationDescriptor => {
    if (status === 'succeeded') {
      return '/inboxes/all';
    } else {
      return '/welcome'
    }
  };

  useEffect(() => {
    if (status === 'succeeded') {
      history?.replace('/inboxes/all');
    }
  }, [status, history]);

  return (
    <StyleProvider hashPriority="high">
      <IntlProvider locale={locale} messages={langMessages}>
        <ConfigProvider theme={antdTheme}>
          <Router>
            <div className="h-full flex flex-col p-5 space-y-5">
              <NavBar />
              <div className="grow app-content overflow-auto">
                <AnimatePresence>
                  <Switch>
                    <Route exact path="/">
                      <Redirect to={redirect()} />
                    </Route>
                    <Route path="/welcome">
                      <Welcome />
                    </Route>
                    <Route path="/nodes">
                      <Switch>
                        <Route path="/nodes/add">
                          <AddNode></AddNode>
                        </Route>
                      </Switch>
                    </Route>
                    <Route path="/inboxes">
                      <Switch>
                        <Route path="/inboxes/all">
                          <Inboxes></Inboxes>
                        </Route>
                      </Switch>
                    </Route>
                  </Switch>
                </AnimatePresence>
              </div>
            </div>
          </Router>
        </ConfigProvider>
      </IntlProvider>
    </StyleProvider>
  );
};
