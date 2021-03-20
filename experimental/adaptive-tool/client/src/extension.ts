/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, window, DiagnosticCollection } from 'vscode';
import * as keyBinding from './providers/keyBinding';
import * as debuggerProvider from './providers/debugger';
import * as env from 'dotenv';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

let lgClient: LanguageClient;
let luClient: LanguageClient;
let qnaClient: LanguageClient;

export function activate(context: ExtensionContext) {
    env.config({ path: path.resolve(__dirname, '../../.env') });
	startLgClient(context);
	startLuClient(context);
	startQnaClient(context);
	keyBinding.activate(context);
    debuggerProvider.activate(context);
}

function startLgClient(context: ExtensionContext) {
    // The server is implemented in node
	const serverModule = context.asAbsolutePath(
        process.env.NODE_DEBUG === 'true' ?
            path.join('server', 'out', 'lg', 'src',  'server.js'):
            path.join('server', 'out', 'lgserver.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6010'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for .lg documents
		documentSelector: [{ scheme: 'file', language: 'lg' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		middleware: {
			workspace: {
				didChangeWorkspaceFolders: ((data, next) => {
					next(data);
				})
			},
			provideFoldingRanges: (document, context, token, next) => next(document, context, token)
		},
		diagnosticCollectionName: 'lg'
	};

	// Create the language client and start the client.
	lgClient = new LanguageClient(
		'lg',
		'Language Server For LG',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	lgClient.start();
	
    const collection: DiagnosticCollection = lgClient.diagnostics;
	context.subscriptions.push(workspace.onDidCloseTextDocument(doc => {
        if (doc && isLgFile(doc.fileName))
        {
            collection.delete(doc.uri);
        }
	}));
}

function startLuClient(context: ExtensionContext) {
    // The server is implemented in node
	const serverModule = context.asAbsolutePath(
        process.env.NODE_DEBUG === 'true' ?
            path.join('server', 'out', 'lu', 'src',  'server.js'):
            path.join('server', 'out', 'luserver.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6011'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for .lg documents
		documentSelector: [{ scheme: 'file', language: 'lu' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		middleware: {
			executeCommand: async (command, args, next) => {
				const editor = window.activeTextEditor;
				const cursorPos = editor.selection.active;
				const uri = editor.document.uri.toString();
				args.push(uri);
				args.push(cursorPos);
				args.push(editor.document.lineAt(cursorPos.line).range.end);
				next(command, args);
			},
			provideFoldingRanges: (document, context, token, next) => next(document, context, token),
			workspace: {
				didChangeWorkspaceFolders: ((data, next) => {
					next(data);
				})
			}
		},
		diagnosticCollectionName: 'lu'
	};

	// Create the language client and start the client.
	luClient = new LanguageClient(
		'lu',
		'Language Server For LU',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	luClient.start();
	
    const collection: DiagnosticCollection = luClient.diagnostics;
	context.subscriptions.push(workspace.onDidCloseTextDocument(doc => {
        if (doc && isLuFile(doc.fileName))
        {
            collection.delete(doc.uri);
        }
	}));
}

function startQnaClient(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		process.env.NODE_DEBUG === 'true' ?
            path.join('server', 'out', 'qna', 'src',  'server.js'):
            path.join('server', 'out', 'qnaserver.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6012'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for .qna documents
		documentSelector: [{ scheme: 'file', language: 'qna' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		middleware: {
			executeCommand: async (command, args, next) => {
				const editor = window.activeTextEditor;
				const cursorPos = editor.selection.active;
				const uri = editor.document.uri.toString();
				args.push(uri);
				args.push(cursorPos);
				args.push(editor.document.lineAt(cursorPos.line).range.end);
				next(command, args);
			},
			provideFoldingRanges: (document, context, token, next) => next(document, context, token),
			workspace: {
				didChangeWorkspaceFolders: ((data, next) => {
					next(data);
				})
			}
		},
		diagnosticCollectionName: 'qna'
	};

	// Create the language client and start the client.
	qnaClient = new LanguageClient(
		'qna',
		'Language Server For QNA',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	qnaClient.start();
	
    const collection: DiagnosticCollection = qnaClient.diagnostics;
	context.subscriptions.push(workspace.onDidCloseTextDocument(doc => {
        if (doc && isQnaFile(doc.fileName))
        {
            collection.delete(doc.uri);
        }
	}));
}

export function deactivate(): Thenable<void> {
	const promises: Thenable<void>[] = [];
	if (lgClient) {
		promises.push(lgClient.stop());
	}
	if (luClient) {
		promises.push(luClient.stop());
	}
	if (qnaClient) {
		promises.push(qnaClient.stop());
	}
	return Promise.all(promises).then(() => undefined);
}

function isLgFile(fileName: string): boolean {
    if(fileName === undefined || !fileName.toLowerCase().endsWith('.lg')) {
        return false;
    }
    return true;
}

function isLuFile(fileName: string): boolean {
    if(fileName === undefined || !fileName.toLowerCase().endsWith('.lu')) {
        return false;
    }
    return true;
}

function isQnaFile(fileName: string): boolean {
    if(fileName === undefined || !fileName.toLowerCase().endsWith('.qna')) {
        return false;
    }
    return true;
}