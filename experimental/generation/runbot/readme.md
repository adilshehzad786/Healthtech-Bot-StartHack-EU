﻿# RunBot

This bot allows you to easily run Bot Framework Adaptive Dialog declarative samples that use only standard SDK components.
It starts a web server you can connect the Bot Framework Emulator to at `http://localhost:5000/api/messages` and interact with your bot.
If you're using this bot as part of the dialog generation flow, see [Dialog Generation][generation] for complete documentation.  

## Setup

In order to setup runbot:

1. Ensure you have the [dotnet] runtime installed on your machine.
2. Ensure you have [git] installed on your machine.
3. Open a shell window:
   1. Change to the directory where you want the repo located.
   2. Run `git clone https://github.com/microsoft/BotBuilder-Samples.git`.
4. To use LUIS you need to register your LUIS endpoint key by running `dotnet user-secrets --id RunBot set luis:endpointKey <yourKey>` once.

## Usage

The simplest way to use runbot is to execute the `run.cmd` windows script or `run` BASH script in the output generated dialog directory.  If you want to execute it directly, you can execute the command 
```
dotnet run --project <pathToRepo>/experimental/generation/runbot/runbot.csproj --root <directoryWithDeclarativeAssets>
```
At that point you can connect to your bot using `http://localhost:5000/api/messages` in the [Bot Framework Emulator][emulator].

Command line args:

* **--root <PATH>**: Absolute path to the root directory for declarative resources all *.dialog will be options.  Defaults to the current directory.
* **--region <REGION>**: LUIS endpoint region.  Default is `westus`.
* **--environment <ENVIRONMENT>**: LUIS environment settings to use.  Default is the user alias. This is used to find your `luis.settings.<environment>.<region>.json` settings file for LUIS.
* **--dialog <DIALOG>**: Name of root dialog to run.  By default all root *.dialog will be choices.

## Troubleshooting

* **Missing LUIS endpoint key**: If you are unable to interact with LUIS, ensure the same LUIS key was used when running `bf luis:build` as in `luis:endpointKey` from `dotnet user-secrets list --id RunBot`.

* **Missing LUIS app ID**: If you are missing an appid, most likely the `build` script did not run successfully. Either make sure you pass in the LUIS key to the script or have done `bf config:set:luis --authoringKey <key>`.

[dotnet]:https://dotnet.microsoft.com/download
[git]:https://git-scm.com/downloads
[samples]:https://github.com/microsoft/BotBuilder-Samples.git
[emulator]:https://github.com/Microsoft/BotFramework-Emulator
[generation]:https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/generation/generator
