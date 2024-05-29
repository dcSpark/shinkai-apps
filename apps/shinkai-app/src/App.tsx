import './theme/global.css';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';

import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Redirect, Route } from 'react-router-dom';

import AddAgent from './pages/AddAgent';
import AdminCommands from './pages/AdminCommands';
import Chat from './pages/Chat';
import Connect from './pages/Connect';
import CreateChat from './pages/CreateChat';
import CreateJob from './pages/CreateJob';
import Home from './pages/Home';
import JobChat from './pages/JobChat';
import Settings from './pages/Settings';
import { useAuth } from './store/auth';

setupIonicReact();

function PrivateRoute({
  children,
  ...rest
}: {
  children: React.ReactNode;
  path: string;
  exact?: boolean;
}) {
  const auth = useAuth((state) => state.auth);
  return (
    <Route
      {...rest}
      render={() => {
        return auth ? children : <Redirect to="/connect" />;
      }}
    />
  );
}

const App: React.FC = () => {
  return (
    <QueryProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route component={Connect} path="/connect" />
            <PrivateRoute exact path="/home">
              <Home />
            </PrivateRoute>
            <PrivateRoute exact path="/admin-commands">
              <AdminCommands />
            </PrivateRoute>
            <PrivateRoute exact path="/create-job">
              <CreateJob />
            </PrivateRoute>
            <PrivateRoute exact path="/create-chat">
              <CreateChat />
            </PrivateRoute>
            <PrivateRoute exact path="/add-agent">
              <AddAgent />
            </PrivateRoute>
            <PrivateRoute exact path="/chat/:id">
              <Chat />
            </PrivateRoute>
            <PrivateRoute exact path="/job-chat/:id">
              <JobChat />
            </PrivateRoute>
            <PrivateRoute path="/settings">
              <Settings />
            </PrivateRoute>
            <Redirect exact from="/" to="/home" />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </QueryProvider>
  );
};

export default App;
