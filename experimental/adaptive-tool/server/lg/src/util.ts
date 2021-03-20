/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { TextDocument, Range, Position } from "vscode-languageserver-textdocument";
import { DocumentUri, Files, WorkspaceFolder } from 'vscode-languageserver';
import { Templates, } from "botbuilder-lg";
import { TemplatesStatus, TemplatesEntity } from "./templatesStatus";
import { ReturnType } from "adaptive-expressions";
import { buildInfunctionsMap, FunctionEntity } from './buildinFunctions';
import { URI } from 'vscode-uri';

import * as fs from 'fs';
import * as path from 'path';

export function isLgFile(fileName: string): boolean {
    if(fileName === undefined || !fileName.toLowerCase().endsWith('.lg')) {
        return false;
    }
    return true;
}

export function isInFencedCodeBlock(doc: TextDocument, position: Position): boolean {
    const textBefore = doc.getText({ start: {line: 0, character: 0}, end: position });
    const matches = textBefore.match(/```/gm);
    if (matches == null) {
        return false;
    } else {
        return matches.length % 2 != 0;
    }
}

export function getTemplatesFromCurrentLGFile(lgFileUri: DocumentUri) : Templates {

    let result = new Templates();
    const engineEntity: TemplatesEntity | undefined = TemplatesStatus.templatesMap.get(Files.uriToFilePath(lgFileUri)!);
    if (engineEntity !== undefined && engineEntity.templates.allTemplates.length > 0) {
        result = engineEntity.templates;
    }

    return result;
}

export function getreturnTypeStrFromReturnType(returnType: ReturnType): string {
    let result = '';
    switch(returnType) {
        case ReturnType.Boolean: result = "boolean";break;
        case ReturnType.Number: result = "number";break;
        case ReturnType.Object: result = "any";break;
        case ReturnType.String: result = "string";break;
        case ReturnType.Array: result = "array";break;
    }

    return result;
}

export function getAllFunctions(lgFileUri: DocumentUri): Map<string, FunctionEntity> {
    const functions: Map<string, FunctionEntity> = new Map<string, FunctionEntity>();

    for (const func of buildInfunctionsMap) {
        functions.set(func[0],func[1]);
    }

    const templates: Templates = getTemplatesFromCurrentLGFile(lgFileUri);

    for (const template of templates.allTemplates) {
        const functionEntity = new FunctionEntity(template.parameters, ReturnType.Object, `Template reference\r\n ${template.body}`);
        let templateName = template.name;
        if (buildInfunctionsMap.has(template.name)) {
            templateName = 'lg.' + template.name;
        }
        functions.set(templateName, functionEntity);
    }

    return functions;
}


export function getFunctionEntity(lgFileUri: DocumentUri, name: string): FunctionEntity|undefined {
    const allFunctions = getAllFunctions(lgFileUri);

    if (allFunctions.has(name)) {
        return allFunctions.get(name);
    } else if (name.startsWith('lg.')){
        const pureName = name.substr('lg.'.length);
        if (allFunctions.has(pureName)) {
            return allFunctions.get(pureName);
        }
    } else {
        const lgWordName = 'lg.' + name;
        if (allFunctions.has(lgWordName)) {
            return allFunctions.get(lgWordName);
        }
    }
    return undefined;
}

export function getWordRangeAtPosition(document: TextDocument, position: Position): Range|undefined {
    const text = document.getText();
    const line = position.line;
    const pos = position.character;
    const lineText = text.split('\n')[line];
    let match: RegExpMatchArray | null;
    const wordDefinition = /[a-zA-Z0-9_/.-]+/g;
    while ((match = wordDefinition.exec(lineText))) {
        const matchIndex = match.index || 0;
        if (matchIndex > pos) {
            return undefined;
        } else if (wordDefinition.lastIndex >= pos) {
            return {start: {line: line, character: matchIndex}, end: {line: line, character: wordDefinition.lastIndex}};
        }  
    }
    return undefined;
}

export function triggerLGFileFinder(workspaceFolders: WorkspaceFolder[]) {
    TemplatesStatus.lgFilesOfWorkspace = [];
    workspaceFolders?.forEach(workspaceFolder => fs.readdir(URI.parse(workspaceFolder.uri).fsPath, (err, files) => {
        if(err) {
            console.log(err);
        } else {
            TemplatesStatus.lgFilesOfWorkspace = [];
            files.filter(file => isLgFile(file)).forEach(file => {
                TemplatesStatus.lgFilesOfWorkspace.push(path.join(URI.parse(workspaceFolder.uri).fsPath, file));
            });
        }
    }));
}

export const cardPropDict = {
    CardAction: [
        {name:'title', placeHolder:'your_title'},
        {name:'type', placeHolder:'imBack'}, 
        {name:'value', placeHolder:'your_value'}],
    Cards: [
        {name:'text', placeHolder:'text'},
        {name:'buttons', placeHolder:'button_list'}],
    Attachment: [
        {name:'contenttype', placeHolder:'herocard'},
        {name:'content', placeHolder:'attachment_content'}],
    Others: [
        {name:'type', placeHolder:'typename'},
        {name:'value', placeHolder:'value'}],
    Activity: [
        {name:'text', placeHolder:'text_result'}]
  };


  export const cardPropDictFull = {
    CardAction: [
        {name:'type', placeHolder:'imBack'},
        {name:'title'}, 
        {name:'image'},
        {name:'text'},
        {name:'displayText'},
        {name:'channelData'},
        {name:'image'},
        {name:'image'},
        {name:'image'}],
    HeroCard: [
        {name:'title', placeHolder:'your_title'},
        {name:'subtitle', placeHolder:'your_subtitle'},
        {name:'text', placeHolder:'text'},
        {name:'buttons', placeHolder:'button_list'},
        {name:'images', placeHolder:'image_list'},
        {name:'tap', placeHolder:'tap'}],
    ThumbnailCard: [
        {name:'title', placeHolder:'your_title'},
        {name:'subtitle', placeHolder:'your_subtitle'},
        {name:'text', placeHolder:'text'},
        {name:'buttons', placeHolder:'button_list'},
        {name:'images', placeHolder:'image_list'},
        {name:'tap', placeHolder:'tap'}],
    AudioCard: [
        {name:'title', placeHolder:'your_title'},
        {name:'subtitle', placeHolder:'your_subtitle'},
        {name:'text', placeHolder:'text'},
        {name:'media', placeHolder:'media_list'},
        {name:'buttons', placeHolder:'button_list'},
        {name:'shareable', placeHolder:'false'},
        {name:'autoloop', placeHolder:'false'},
        {name:'autostart', placeHolder:'false'},
        {name:'aspect'},
        {name:'image'},
        {name:'duration'},
        {name:'value'}],
    VideoCard: [
        {name:'title', placeHolder:'your_title'},
        {name:'subtitle', placeHolder:'your_subtitle'},
        {name:'text', placeHolder:'text'},
        {name:'media', placeHolder:'media_list'},
        {name:'buttons', placeHolder:'button_list'},
        {name:'shareable', placeHolder:'false'},
        {name:'autoloop', placeHolder:'false'},
        {name:'autostart', placeHolder:'false'},
        {name:'aspect'},
        {name:'image'},
        {name:'duration'},
        {name:'value'}],
    AnimationCard: [
        {name:'title', placeHolder:'your_title'},
        {name:'subtitle', placeHolder:'your_subtitle'},
        {name:'text', placeHolder:'text'},
        {name:'media', placeHolder:'media_list'},
        {name:'buttons', placeHolder:'button_list'},
        {name:'shareable', placeHolder:'false'},
        {name:'autoloop', placeHolder:'false'},
        {name:'autostart', placeHolder:'false'},
        {name:'aspect'},
        {name:'image'},
        {name:'duration'},
        {name:'value'}],
    SigninCard: [
        {name:'text', placeHolder:'text'},
        {name:'buttons', placeHolder:'button_list'}],
    OAuthCard: [
        {name:'text', placeHolder:'text'},
        {name:'buttons', placeHolder:'button_list'},
        {name:'connectionname'}],
    ReceiptCard: [
        {name:'title'},
        {name:'facts'},
        {name:'items'},
        {name:'tap'},
        {name:'total'},
        {name:'tax'},
        {name:'vat'},
        {name:'buttons'}],
    Attachment: [
        {name:'contenttype', placeHolder:'herocard'},
        {name:'content', placeHolder:'attachment_content'}],
    Others: [
        {name:'type', placeHolder:'typename'},
        {name:'value', placeHolder:'value'}],
    Activity: [
        {name:'type'},
        {name:'textFormat'},
        {name:'attachmentLayout'},
        {name:'topicName'},
        {name:'locale'},
        {name:'text', placeHolder:'text_result'},
        {name:'speak', placeHolder:'speak_result'},
        {name:'inputHint'},
        {name:'summary'},
        {name:'suggestedActions'},
        {name:'attachments'},
        {name:'entities'},
        {name:'channelData'},
        {name:'action'},
        {name:'label'},
        {name:'valueType'},
        {name:'value'},
        {name:'name'},
        {name:'code'},
        {name:'importance'},
        {name:'deliveryMode'},
        {name:'textHighlights'},
        {name:'semanticAction'},
    ]
  };

export const cardTypes = [
    'HeroCard',
    'SigninCard',
    'ThumbnailCard',
    'AudioCard',
    'VideoCard',
    'AnimationCard',
    'MediaCard',
    'OAuthCard',
    'Attachment',
    'CardAction',
    'AdaptiveCard',
    'Activity',
];

export const optionsMap = {
    options: { 
        '@strict': {
            detail: ' @strict = true',
            documentation: 'Developers who do not want to allow a null evaluated result can implement the strict option.', 
            insertText: ' @strict'},
        '@replaceNull': {
            detail: ' @replaceNull = ${path} is undefined',
            documentation: 'Developers can create delegates to replace null values in evaluated expressions by using the replaceNull option.',
            insertText: ' @replaceNull'},
        '@lineBreakStyle': {
            detail: ' @lineBreakStyle = markdown',
            documentation: 'Developers can set options for how the LG system renders line breaks using the lineBreakStyle option.',
            insertText: ' @lineBreakStyle'},
        '@Namespace': {
            detail: ' @Namespace = foo',
            documentation: 'You can register a namespace for the LG templates you want to export.',
            insertText: ' @Namespace'},
        '@Exports': {
            detail: ' @Exports = template1, template2',
            documentation: 'You can specify a list of LG templates to export.',
            insertText: ' @Exports'}
    },
    strictOptions : {
        'true': {
            detail: ' true',
            documentation: 'Null error will throw a friendly message.',
            insertText: ' true'
        },
        'false': {
            detail: ' false',
            documentation: 'A compatible result will be given.',
            insertText: ' false'
        }
    },
    replaceNullOptions: {
        '${path} is undefined':{
            detail: 'The null input in the path variable would be replaced with ${path} is undefined.',
            documentation: null,
            insertText: ' ${path} is undefined'
        }    
    },
    lineBreakStyleOptions: {
        'default': {
            detail: ' default',
            documentation: 'Line breaks in multiline text create normal line breaks.',
            insertText: ' default'
        },
        'markdown': {
            detail: ' markdown',
            documentation: 'Line breaks in multiline text will be automatically converted to two lines to create a newline.',
            insertText: ' markdown'
        }
    } 
};
