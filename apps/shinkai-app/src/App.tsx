import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Connect from "./pages/Connect";
import CreateChat from "./pages/CreateChat";
import AddAgent from "./pages/AddAgent";
import CreateJob from "./pages/CreateJob";
import AdminCommands from "./pages/AdminCommands";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";

import "./theme/global.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import JobChat from "./pages/JobChat";

setupIonicReact();

const App: React.FC = () => {
  const setupComplete = localStorage.getItem("setupComplete") === "true";
  console.log(`Setup complete: ${setupComplete}`);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route path="/connect" component={Connect} />
              <Route exact path="/home" component={Home} />
              <Route exact path="/admin-commands" component={AdminCommands} />
              <Route exact path="/create-job" component={CreateJob} />
              <Route exact path="/create-chat" component={CreateChat} />
              <Route exact path="/add-agent" component={AddAgent} />
              <Route exact path="/chat/:id" component={Chat} />
              <Route exact path="/job-chat/:id" component={JobChat} />
              <Route path="/settings" component={Settings} />
              {!setupComplete ? (
                <Redirect exact from="/" to="/connect" />
              ) : (
                <Redirect exact from="/" to="/home" />
              )}
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </PersistGate>
    </Provider>
  );
};

export default App;
