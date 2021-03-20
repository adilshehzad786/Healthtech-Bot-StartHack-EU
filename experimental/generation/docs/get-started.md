# Dialog Generation: Get Started

## Prerequisites

- Node.js version 12 or higher, with `npm` installed.
  You can check your version with `node --version` and download the latest from [node](https://nodejs.org/en/download/) if needed.
- To test your bot locally, you'll need the [BotFramework Emulator][emulator]

## Install the plugin

To use this plugin you need to install it into the latest version of the [BotFramework CLI tool][bf], using the daily build available on our [myget][myget] gallery.

Open a bash window / command prompt and:

1. Point npm at the MyGet feeds: 
   1. `npm config set @microsoft:registry https://botbuilder.myget.org/F/botframework-cli/npm/`
   2. `npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/`
2. Install the CLI tool: `npm install -g @microsoft/botframework-cli`
3. Install the plugin: `bf plugins:install @microsoft/bf-generate`
4. Optionally point npm back to the default: 
   1. `npm config set registry https://registry.npmjs.org/`
   2. `npm config delete @microsoft:registry` 
5. To use the generated `run` script, you need to setup [RunBot][runbot] and also set the environment variable `REPOS` to the parent directory where `botbuilder-samples` is cloned. 
   * **Windows**: `set REPOS=<botbuilder-samples parent>` or if you want the setting to persist, `setx REPOS <botbuilder-samples parent>`
   * **Mac/Linux**: Put `export REPOS=<botbuilder-samples parent>` in your `~/.bash_profile`.
6. Optionally define the default LUIS and QnAMaker keys (otherwise you have to supply them every time you build/run).
   1. `bf config:set:luis --authoringKey <yourKey>`
   1. `bf config:set:qnamaker --subscriptionKey <yourKey>`

Alternatively, you can setup your own Bot Framework runtime which provides the ability to extend the framework using code.  Currently, generated dialogs work best with the current SDK bits in master.

## Using the plugin

Once you've got the tool installed, you can use the plugin.

1. Download an example JSON schema from our [sample schemas][sample-schema], or [create your own][schema].
2. Generate your dialogs: `bf dialog:generate {schema file name} -o generated-dialogs`
3. Switch to your output directory: `cd generated-dialogs`
4. Build and train your LUIS model: `build`
5. At this point you have a complete set of dialogs rooted in `sandwich.main.dialog`.
6. If you have installed [RunBot][runbot], you can run this bot and test your generated dialogs in the emulator:
   1. Start the web server: `run`.  (Run will also call `build` if needed.)
   2. Connect emulator to `http://localhost:5000/api/messages` and interact with your bot.
7. Modify your generated bot to improve it by modifying the generated assets.  If you update your schema, you can merge the changes into your schema.  `bf dialog:generate {schema file name} -o generated-dialogs --merge` It will not overwrite any of the changes you have made and will show you if any of the changes cannot be automatically merged so you can manually merge.

## Troubleshooting

* **No generator found for language**
This happens when you have not set the locale in the emulator to a language that you have .lg assets for. 

* **Cannot find project**
To fix this ensure REPOS is pointing to the directory above botbuilder-samples and does not end in a trailing slash.

## Documentation Index

1. [Get started][start]
1. Working with schema
    1. [Writing schemas][schema]
    1. [Sample schemas][sample-schemas]
1. Working with templates
    1. [Writing templates][templates-overview]
    1. [Pre-built templates][templates]
1. [Presentation (pptx)](2020%20Feb%20MVP%20Generated%20Dialogs.pptx)
1. [White paper (docx)](Generating%20Dialogs%20from%20Schema,%20APIs%20and%20Databases.docx)

[schema]:bot-schema.md
[templates]:../generator/packages/library/templates
[templates-overview]:templates.md
[start]:get-started.md
[sample-schemas]:example-schemas
[bf]:https://github.com/microsoft/botframework-cli
[myget]:https://botbuilder.myget.org/gallery
[emulator]:https://github.com/Microsoft/BotFramework-Emulator
[runbot]:../runbot/readme.md
