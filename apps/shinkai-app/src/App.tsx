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
import { Provider } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import AddAgent from './pages/AddAgent';
import AdminCommands from './pages/AdminCommands';
import Chat from './pages/Chat';
import Connect from './pages/Connect';
import CreateChat from './pages/CreateChat';
import CreateJob from './pages/CreateJob';
import Home from './pages/Home';
import JobChat from './pages/JobChat';
import Settings from './pages/Settings';
import { persistor, store } from './store';
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
      render={({ location }) => {
        return auth ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/connect',
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
}

const App: React.FC = () => {
  const setupComplete = localStorage.getItem('setupComplete') === 'true';
  console.log(`Setup complete: ${setupComplete}`);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
      </PersistGate>
    </Provider>
  );
};

export default App;
