import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { AnimatePresence } from 'framer-motion';
import { LocationDescriptor } from 'history';
import { IntlProvider } from 'react-intl';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import { langMessages, locale } from '../../lang/intl';
import { antdTheme } from '../../theme/antd-theme';
import { AddNode } from '../add-node/add-node';
import NavBar from '../nav/nav';
import Welcome from '../welcome/welcome';

export const PopupApp = () => {
  const redirect = (): LocationDescriptor => {
    return '/welcome';
  };
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
