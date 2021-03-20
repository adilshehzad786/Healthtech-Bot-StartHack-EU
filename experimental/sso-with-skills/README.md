# SSO with Simple Skill Consumer and Skill

Bot Framework v4 skills echo sample.

This bot has been created using [Bot Framework](https://dev.botframework.com), it shows how to create a simple skill consumer (RootBot) that sends message activities to a skill (SkillBot) that echoes it back. It shows how to implement single sign on between a simple skill consumer (RootBot) and a skill (SkillBot).

## Prerequisites

- [.NET Core SDK](https://dotnet.microsoft.com/download) version 3.1

  ```bash
  # determine dotnet version
  dotnet --version
  ```

## Key concepts in this sample

The solution includes a parent bot (`RootBot`) and a skill bot (`SkillBot`) and shows how the parent bot can support a user signin and call a skill on behalf of the user, without the user being required to authenticate again into the skill.

- `RootBot`: this project is a simple skill consumer bot, and supports:
    - `login` command that gets the user to sign into the skill consumer bot's aad application.
    - `token` command that displays the user's token.
    - `logout` command that logs the user out of the skill consumer.
- `SkillBot`: this project shows a simple skill that supports OAuth for AADV2 and can respond to the following commands:
    - `skill login` command that gets the skill consumer bot to sign into the skill's aadV2 app, on behalf of the user. The user is not shown a signin card, unless SSO fails.
    - `skill token` command that displays the user's token from the skill.
    - `skill logout` command that logs the user out of the skill.

## To try this sample

- Clone the repository

    ```bash
    git clone https://github.com/microsoft/botbuilder-samples.git
    ```
- Create a bot registration in the azure portal for the `SkillBot` and update [SkillBot/appsettings.json](SkillBot/appsettings.json) with the `MicrosoftAppId` and `MicrosoftAppPassword` of the new bot registration.
- Update the `BotFrameworkSkills` section in [RootBot/appsettings.json](RootBot/appsettings.json) with the app ID for the skill you created in the previous step.
- Create a bot registration in the azure portal for the `RootBot` and update [RootBot/appsettings.json](RootBot/appsettings.json) with the `MicrosoftAppId` and `MicrosoftAppPassword` of the new bot registration.
- Add the `RootBot` `MicrosoftAppId` to the `AllowedCallers` list in [SkillBot/appsettings.json](SkillBot/appsettings.json).

- Setup the 2 AAD applications for SSO as per steps given in [SkillBot AAD](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication-sso?view=azure-bot-service-4.0&tabs=srb%2Ccsharp#create-the-azure-ad-identity-application-1) and [RootBot AAD](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication-sso?view=azure-bot-service-4.0&tabs=sb%2Ccsharp#create-the-azure-ad-identity-application). You will end up with 2 aad applications - one for the skill consumer and one for the skill.
- Create an aadv2 connection in the bot registration for the `SkillBot` and fill in values from the aadv2 application created for SSO, as per the [docs](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication-sso?view=azure-bot-service-4.0&tabs=srb%2Ccsharp#create-azure-ad-connection-1). Update [SkillBot/appsettings.json](SkillBot/appsettings.json) with the `ConnectionName`  
- Create an aadv2 connection in the bot registration for the `RootBot` and fill in values from the aadv2 application created for SSO, as per the [docs](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication-sso?view=azure-bot-service-4.0&tabs=sb%2Ccsharp#create-azure-ad-connection). Update [RootBot/appsettings.json](SkillBot/appsettings.json) with the `ConnectionName`  

- Open the `SSOWithSkills.sln` solution and configure it to [start debugging with multiple processes](https://docs.microsoft.com/en-us/visualstudio/debugger/debug-multiple-processes?view=vs-2019#start-debugging-with-multiple-processes)

## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.8.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`, the `MicrosoftAppId` and `MicrosoftAppPassword` for the `RootBot`
- Clck `Connect`
- Type `login` and complete the signin flow.  When the flow is complete, a token should be displayed.
- Type `skill login`.  This should initiate the token exchange between the `SkillBot` and `RootBot`, resulting in a valid token displayed.  

## Deploy the bots to Azure

To learn more about deploying a bot to Azure, see [Deploy your bot to Azure](https://aka.ms/azuredeployment) for a complete list of deployment instructions.
