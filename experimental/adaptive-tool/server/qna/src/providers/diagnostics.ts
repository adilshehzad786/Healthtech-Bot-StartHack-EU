/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	Diagnostic, Connection, DiagnosticSeverity
} from 'vscode-languageserver';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';
import * as util from '../util';

const parseFile = require('@microsoft/bf-lu/lib/parser/lufile/luParser');

export async function updateDiagnostics(document: TextDocument, connection: Connection): Promise<void> {

	if (!util.isQnaFile(path.basename(document.uri)))
		return;

	const qnaResource = parseFile.parse(document.getText());

	const diagnostics = qnaResource.Errors;
	const lspDiagnostics: Diagnostic[] = [];

	diagnostics.forEach((u: { Severity: any; Range: { Start: { Line: number; Character: any; }; End: { Line: number; Character: any; }; }; Message: string; }) => {

		let severity: DiagnosticSeverity;
		switch (u.Severity) {
			case "ERROR":
				severity = DiagnosticSeverity.Error;
				break;
			case "WARN":
				severity = DiagnosticSeverity.Warning;
				break;
			default:
				severity = DiagnosticSeverity.Error;
				break;
		}

		const diagItem = Diagnostic.create(
			{
				start: {
					line: u.Range.Start.Line - 1,
					character: u.Range.Start.Character
				},
				end: {
					line: u.Range.End.Line - 1,
					character: u.Range.End.Character
				}
			},
			u.Message,
			severity
		);

		lspDiagnostics.push(diagItem);
	});

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: document.uri, diagnostics: lspDiagnostics });
}
