import { IntlProvider } from 'react-intl';
import { AnimatePresence } from 'framer-motion';
import {
  Redirect,
  Route,
  MemoryRouter as Router,
  Switch,
} from 'react-router-dom';
import { LocationDescriptor } from 'history';
import { langMessages, locale } from '../../lang/intl';
import NavBar from '../nav/nav';
import Welcome from '../welcome/welcome';
import { AddNode } from '../add-node/add-node';

export const PopupApp = () => {
  const redirect = (): LocationDescriptor => {
    return '/welcome';
  };
  return (
    <IntlProvider locale={locale} messages={langMessages}>
      <Router>
        <div className="h-full flex flex-col p-5 space-y-5">
          <NavBar />
          <div className="grow app-content">
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
    </IntlProvider>
  );
};
