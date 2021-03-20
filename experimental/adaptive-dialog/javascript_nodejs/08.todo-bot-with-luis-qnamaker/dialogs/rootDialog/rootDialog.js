// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { DialogEvents, ComponentDialog } = require('botbuilder-dialogs');
const { QnAMakerRecognizer, CrossTrainedRecognizerSet, DeleteProperty, TextInput, CodeAction, BreakLoop, EmitEvent, SetProperty, OnChooseIntent, OnQnAMatch, CancelAllDialogs, ActivityTemplate, ConfirmInput, IfCondition, ForEach, OnConversationUpdateActivity, LuisAdaptiveRecognizer, BeginDialog, OnIntent, AdaptiveDialog, SendActivity, TemplateEngineLanguageGenerator } = require('botbuilder-dialogs-adaptive');
const { Templates } = require('botbuilder-lg');
const { IntExpression, Expression, ValueExpression, BoolExpression, StringExpression } = require('adaptive-expressions');
const { AdaptiveEvents } = require('botbuilder-dialogs-adaptive/lib/adaptiveEvents');
const { ViewToDoDialog } = require('../viewToDoDialog/viewToDoDialog');
const { GetUserProfileDialog } = require('../getUserProfileDialog/getUserProfileDialog');
const { DeleteToDoDialog } = require('../deleteToDoDialog/deleteToDoDialog');
const { AddToDoDialog } = require('../addToDoDialog/addToDoDialog');
const { ActivityFactory } = require('botbuilder');

const path = require('path');

// Note: Dialog name needs to match with the file name for cross-train CLI commands and the recognizer to work E2E.
const DIALOG_ID = 'rootDialog';

class RootDialog extends ComponentDialog {
    constructor() {
        super(DIALOG_ID);
        const lgFile = Templates.parseFile(path.join(__dirname, 'rootDialog.lg'));
        this.lgGenerator = new TemplateEngineLanguageGenerator(lgFile);
        const dialog = new AdaptiveDialog(DIALOG_ID).configure({
            generator: this.lgGenerator,
            recognizer: this.createCrossTrainedRecognizer(),
            triggers: [
                new OnConversationUpdateActivity(this.welcomeUserSteps()),

                // Intent rules for the LUIS model. Each intent here corresponds to an intent defined in ./Dialogs/Resources/ToDoBot.lu file
                new OnIntent("Greeting", [], [
                    new SendActivity("${HelpRootDialog()}"),
                ]),
                new OnIntent("AddItem", [], 
                    [
                        new BeginDialog(AddToDoDialog.dialogName),
                    ],
                    // LUIS returns a confidence score with intent classification. 
                    // Conditions are expressions. 
                    // This expression ensures that this trigger only fires if the confidence score for the 
                    // AddToDoDialog intent classification is at least 0.5
                    "#AddItem.Score >= 0.5"                    
                ),
                new OnIntent("ViewItem", [], [
                    new BeginDialog(ViewToDoDialog.dialogName),
                ], "#ViewItem.Score >= 0.5"),
                new OnIntent("GetUserProfile", [], [
                    new BeginDialog(GetUserProfileDialog.dialogName),
                ], "#GetUserProfile.Score >= 0.5"),
                new OnIntent("DeleteItem", [], [
                    new BeginDialog(DeleteToDoDialog.dialogName),
                ], "#DeleteItem.Score >= 0.5"),
                new OnIntent("Cancel", [], [
                    // Ask user for confirmation.
                    // This input will still use the recognizer and specifically the confirm list entity extraction.
                    new ConfirmInput().configure(
                    {
                        prompt: new ActivityTemplate("${Cancel.prompt()}"),
                        property: new StringExpression("turn.confirm"),
                        value: new ValueExpression("=@confirmation"),
                        // Allow user to intrrupt this only if we did not get a value for confirmation.
                        allowInterruptions: new BoolExpression("!@confirmation"),
                    }),
                    new IfCondition().configure(
                    {
                        condition: new BoolExpression("turn.confirm == true"),
                        actions :[
                            // This is the global cancel in case a child dialog did not explicit handle cancel.
                            new SendActivity("Cancelling all dialogs.."),

                            // SendActivity supports full language generation resolution.
                            // See here to learn more about language generation
                            // https://aka.ms/language-generation
                            new SendActivity("${WelcomeActions()}"),
                            new CancelAllDialogs(),
                        ],
                        elseActions: [
                            new SendActivity("${CancelCancelled()}"),
                            new SendActivity("${WelcomeActions()}"),
                        ],
                    }),
                ],"#Cancel.Score >= 0.8"),
                
                // Help and chitchat is handled by qna
                new OnQnAMatch([
                    // Use code action to render QnA response. This is also a demonstration of how to use code actions to light up custom functionality.
                    new CodeAction(this.resolveAndSendQnAAnswer.bind(this))
                ]),

                // This trigger matches if the response from your QnA KB has follow up prompts.
                new OnQnAMatch([
                    new SetProperty().configure({
                        property: new StringExpression("dialog.qnaContext"),
                        value: new ValueExpression("=turn.recognized.answers[0].context.prompts")
                    }),
                    new TextInput().configure({
                        prompt: new ActivityTemplate('${ShowMultiTurnAnswer()}'),
                        property: new StringExpression('turn.qnaMultiTurnResponse'),
                        // We want the user to respond to the follow up prompt. Do not allow interruptions.
                        allowInterruptions: new BoolExpression("false"),
                        // Since we can have multiple instances of follow up prompts within a single turn, set this to always prompt. 
                        // Alternate to doing this is to delete the 'turn.qnaMultiTurnResponse' property before the EmitEvent.
                        alwaysPrompt: new BoolExpression("true")
                    }),
                    new SetProperty().configure({
                        property: new StringExpression("turn.qnaMatchFromContext"),
                        value: new ValueExpression("=where(dialog.qnaContext, item, item.displayText == turn.qnaMultiTurnResponse)")
                    }),
                    new DeleteProperty().configure({
                        property: new StringExpression("dialog.qnaContext")
                    }),
                    new IfCondition().configure({
                        condition: new BoolExpression("turn.qnaMatchFromContext && count(turn.qnaMatchFromContext) > 0"),
                        actions: [
                            new SetProperty().configure({
                                property: new StringExpression("turn.qnaIdFromPrompt"),
                                value: new ValueExpression("=turn.qnaMatchFromContext[0].qnaId")
                            }),
                            new EmitEvent().configure({
                                eventName: new StringExpression(DialogEvents.activityReceived),
                                eventValue: new ValueExpression("=turn.activity")
                            })
                        ]
                    })
                ], "count(turn.recognized.answers[0].context.prompts) > 0"),

                // This trigger fires when the recognizers do not agree on who should win.
                // This enables you to write simple rules to pick a winner or ask the user for disambiguation.
                new OnChooseIntent([
                    new SetProperty().configure(
                    {
                        property: new StringExpression("dialog.luisResult"),
                        value: new ValueExpression(`=jPath(turn.recognized, "$.candidates{.id == 'LUIS_${DIALOG_ID}'}[0]")`)
                    }),
                    new SetProperty().configure(
                    {
                        property: new StringExpression("dialog.qnaResult"),
                        value: new ValueExpression(`=jPath(turn.recognized, "$.candidates{.id == 'QnA_${DIALOG_ID}'}[0]")`)
                    }),

                    // Rules to determine winner before disambiguation
                    // Rule 1: High confidence result from LUIS and Low confidence result from QnA => Pick LUIS result
                    new IfCondition().configure(
                    {
                        condition: new BoolExpression("dialog.luisResult.score >= 0.9 && dialog.qnaResult.score <= 0.5"),
                        actions: [
                            // By Emitting a recognized intent event with the recognition result from LUIS, adaptive dialog
                            // will evaluate all triggers with that recognition result.
                            new EmitEvent().configure(
                            {
                                eventName: new StringExpression(AdaptiveEvents.recognizedIntent),
                                eventValue: new ValueExpression("=dialog.luisResult.result")
                            }),
                            new BreakLoop()
                        ]
                    }),

                    // Rule 2: High confidence result from QnA, Low confidence result from LUIS => Pick QnA result
                    new IfCondition().configure(
                    {
                        condition: new BoolExpression("dialog.luisResult.score <= 0.5 && dialog.qnaResult.score >= 0.9"),
                        actions: [
                            new EmitEvent().configure(
                            {
                                eventName: new StringExpression(AdaptiveEvents.recognizedIntent),
                                eventValue: new ValueExpression("=dialog.qnaResult.result")
                            }),
                            new BreakLoop()
                        ]
                    }),

                    // Rule 3: QnA has exact match (>=0.95) => Pick QnA result
                    new IfCondition().configure(
                    {
                        condition: new BoolExpression("dialog.qnaResult.score >= 0.95"),
                        actions: [
                            new EmitEvent().configure(
                            {
                                eventName: new StringExpression(AdaptiveEvents.recognizedIntent),
                                eventValue: new ValueExpression("=dialog.qnaResult.result")
                            }),
                            new BreakLoop()
                        ]
                    }),

                    // Rule 4: QnA came back with no match => Pick LUIS result
                    new IfCondition().configure(
                    {
                        condition: new BoolExpression("dialog.qnaResult.score <= 0.05"),
                        actions: [
                            new EmitEvent().configure(
                            {
                                eventName: new StringExpression(AdaptiveEvents.recognizedIntent),
                                eventValue: new ValueExpression("=dialog.luisResult.result")
                            }),
                            new BreakLoop()
                        ]
                    }),
    
                    // None of the rules were true. So ask user to disambiguate. 
                    new TextInput().configure(
                    {
                        property: new StringExpression("turn.intentChoice"),
                        prompt: new ActivityTemplate("${chooseIntentResponseWithCard()}"),
                        // Adaptive card 'data' is automatically bound to entities or intent.
                        // You can include 'intent':'value' in your adaptive card's data to pick that up as an intent.
                        value: new ValueExpression("=@userChosenIntent"),
                        alwaysPrompt: new BoolExpression("true"),
                        allowInterruptions: new BoolExpression("false")
                    }),

                    // Decide which recognition result to use based on user response to disambiguation. 
                    new IfCondition().configure(
                    {
                        condition: new BoolExpression("turn.intentChoice != 'none'"),
                        actions: [
                            new EmitEvent().configure(
                            {
                                eventName: new StringExpression(AdaptiveEvents.recognizedIntent),
                                eventValue: new ValueExpression("=dialog[turn.intentChoice].result")
                            })
                        ],
                        elseActions: [
                            new SendActivity("Sure, no worries.")
                        ],
                    }),
                ]),
            ]
        });

        // Add named dialogs to the DialogSet. These names are saved in the dialog state.
        this.addDialog(dialog);

        // Add other dialogs
        this.addDialog(new ViewToDoDialog());
        this.addDialog(new GetUserProfileDialog());
        this.addDialog(new DeleteToDoDialog());
        this.addDialog(new AddToDoDialog());

        // The initial child Dialog to run.
        this.initialDialogId = DIALOG_ID;
    }

    createLuisRecognizer() {
        if (process.env.RootDialog_en_us_lu === "" || process.env.LuisAPIHostName === "" || process.env.LuisAPIKey === "")
            throw `Sorry, you need to configure your LUIS application and update .env file.`;
        return new LuisAdaptiveRecognizer().configure(
            {
                endpoint: new StringExpression(process.env.LuisAPIHostName),
                endpointKey: new StringExpression(process.env.LuisAPIKey),
                applicationId: new StringExpression(process.env.RootDialog_en_us_lu),

                // Id needs to be LUIS_<dialogName> for cross-trained recognizer to work.
                id: `LUIS_${DIALOG_ID}`
            }
        );
    }

    createQnARecognizer() {
        if (process.env.TodoBotWithLuisAndQnAJS_en_us_qna === "" || process.env.QnAHostName === "" || process.env.QnAEndpointKey === "")
            throw `Sorry, you need to configure your QnA Maker KB and update .env file.`;
        let qnaRecognizer = new QnAMakerRecognizer();
        qnaRecognizer.hostname = new StringExpression(process.env.QnAHostName);
        qnaRecognizer.knowledgeBaseId = new StringExpression(process.env.TodoBotWithLuisAndQnAJS_en_us_qna);
        qnaRecognizer.endpointKey = new StringExpression(process.env.QnAEndpointKey);

        // Property path where previous qna id is set. This is required to have multi-turn QnA working.
        qnaRecognizer.qnaId = new IntExpression("turn.qnaIdFromPrompt");

        // Id needs to be QnA_<dialogName> for cross-trained recognizer to work.
        qnaRecognizer.id = `QnA_${DIALOG_ID}`;
        return qnaRecognizer;
    }

    createCrossTrainedRecognizer() {
        let recognizer = new CrossTrainedRecognizerSet();
        recognizer.recognizers = [
            this.createLuisRecognizer(),
            this.createQnARecognizer()
        ];
        return recognizer;
    }

    welcomeUserSteps() {
        return [
            // Iterate through membersAdded list and greet user added to the conversation.
            new ForEach().configure({
                itemsProperty: new StringExpression('turn.activity.membersAdded'),
                actions: [
                    // Note: Some channels send two conversation update events - one for the Bot added to the conversation and another for user.
                    // Filter cases where the bot itself is the recipient of the message.
                    new IfCondition().configure({
                        condition: new BoolExpression('$foreach.value.name != turn.activity.recipient.name'),
                        actions: [
                            new SendActivity('${IntroMessage()}'),
                            // Initialize global properties for the user.
                            new SetProperty().configure(
                            {
                                property: new StringExpression("user.lists"),
                                value: new ValueExpression("={todo : [], grocery : [], shopping : []}")
                            })
                        ]
                    })
                ]
            })
        ];
    }

    // Code action to process response from QnA maker using the generator for this dialog.
    // You can use code action to perform any operation including memory mutations. 
    resolveAndSendQnAAnswer = async function(dc, options)
    {
        let exp1 = Expression.parse("@answer").tryEvaluate(dc.state).value;
        let resVal = await this.lgGenerator.generate(dc, exp1, dc.state);
        await dc.context.sendActivity(ActivityFactory.fromObject(resVal));
        return await dc.endDialog(options);
    }
}

module.exports.RootDialog = RootDialog;