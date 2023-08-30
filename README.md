<h1 align="center">
  <img src="assets/visor-logo.png" width="224px"/><br/>
  Agrihan Visor
</h1>
<p align="center">Agrihan Visor is a chrome extension which unlocks the full capabilities/automation of first-class LLM (AI) support in the web browser. It enables creating multiple agents, each connected to either local or 3rd-party LLMs (ex. OpenAI GPT), which have permissioned (meaning secure) access to act in every webpage you visit.</p><br/>

Agrihan Visor is designed to be your go-to solution for users interacting with LLMs period, thereby offering essential features such as:

- Pulling up the AI Launcher (think Spotlight on Macs) via hotkey to instantly request your Agent to automate anything in your web browser
- Start/continue conversations with ChatGPT or any LLM of your choice without leaving your browser window (with entire history backlog available)
- Full per-agent permission system, allowing you to control which agents can read/interact with certain webpages.
- Enables development of a new generation of AV (Agrihan Visor) Web Apps that securely interact with your agents leaking your API keys or data. Web devs can treat your personal agents like external library calls, with no registration required, no API keys, just direct communication with the user's LLMs.
- Provides a cross-extension messaging solution, enabling building Agihan Visor Web Extensions which augment Agrihan Visor's key capabilities (ex. a specific extension built for Twitter which offers advanced automation/summarization above and beyond using the LLM by itself)

## Getting Started

The fastest way to get started using Agrihan Visor is via the [Chrome Web Store]().

This will provide you with a seamless install process and allow you to get up and running instantly. Alternatively the instructions below allow you to compile Agrihan Visor locally.

## Compile It Yourself

To get started first clone this repo:

```
$ git clone https://github.com/dcSpark-ai/agrihan-visor
```

Once you have done that simply use `npm` to compile it yourself:

```
$ cd visor-extension
$ nvm use
$ npm install
$ npm start
```

This will install all of the dependencies and build the extension. Now that the project has been built, you can add the extension to your Chrome browser via the following steps:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory which has been created through the compilation process.

## ⚙️ Agrihan Visor API

After a user installs the Agrihan Visor extension into their web browser, the extension will inject a listener into each webpage that they visit. This allows both AV Web Apps and AV Extensions to import the `av-core` library to use the exposed `agrihanVisor` API object which seamlessly handles interacting directly with Agrihan Visor, and thus the user's ship, without having to do any extra setup at all. (Note: Originally Agrihan Visor injected the API directly into each web page, however in order to unify the Agrihan Web App and AV Extension development experience at his approach was reworked into the current solution)

Below you will find the API which the current version of Agrihan Visor supports. If a given method requires permission, this means that the user must grant the website permission to have access to use this method. If this authorization has not yet been given, Agrihan Visor will automatically ask the user to authorize said permission upon attempt to use said method.

| Method                  | Description                                                                                               | Requires Permission | Input                                                          | Returns             |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- | ------------------- |
| `isConnected`           | Returns whether or not the user actively has an agent connected.                                          | No                  | `()`                                                           | `boolean`           |
| `getLLMName`            | Returns the name of the LLM that the agent is using.                                                      | Yes                 | `()`                                                           | `string`            |
| `requestPermissions`    | Domain/app requests for permissions to be able to use the connected Agent.                                | No                  | `Array<Permission>`                                            | `void`              |
| `authorizedPermissions` | Returns the permissions that the user has authorized for the current domain/agent.                        | No                  | `()`                                                           | `Array<Permission>` |
| `on`                    | Adds an event listener for a subscription to Agrihan Visor Events (ex. user switched to different agent). | No                  | `(eventType: string, keys: Array<string>, callback: Function)` | `Subscription`      |
| `off`                   | Removes an event listener set up by `on()`.                                                               | No                  | `Subscription` (returned by `.on()`)                           | undefined           |
| `require`               | Requests the required permissions for your app and ensures their presence before triggering callback.     | No                  | `(perms: Array<Permission>, callback: Function)`               | undefined           |

### .require()

Agrihan Visor offers a endpoint to make the initial setup of your app much easier, thereby cleaning up most of the boilerplate.

On the top page of your app (e.g. `App.tsx`) run `agrihanVisor.require` and pass it two pieces of data: one array with the permissions you want, and a callback function to automatically query for the data that you know you will need.

If the connected agent has not granted the current domain the permissions required yet, they will be automatically requested, and once granted by the user, it will know that they were granted and automatically run the setData callback. This greatly reducing the amount of initial code you need to write so you can focus on your business logic for your apps.
