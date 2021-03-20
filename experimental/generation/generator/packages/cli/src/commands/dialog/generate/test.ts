/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Command, flags} from '@microsoft/bf-cli-command'
import {generateTest} from '@microsoft/bf-generate-library'

export default class TestDialog extends Command {
    static description = '[PREVIEW] Generate a .dialog test file from a .transcript file.'

    static examples = [`
      $ bf dialog:test bot.transcript myBot.dialog
    `]

    static args = [
        {name: 'transcript', required: true, description: 'Transcript file to use for generating .dialog file'},
        {name: 'dialog', required: true, description: 'Dialog to test.'}
    ]

    static flags: flags.Input<any> = {
        mock: flags.boolean({char: 'm', description: 'If specified, mock HttpRequest calls.', default: false, required: false}),
        output: flags.string({char: 'o', description: 'Output path for <transcriptName>.dialog test file.', default: '.', required: false}),
        schema: flags.string({char: 's', description: 'Path to app.schema file.', required: false})
    }

    async run() {
        const {args, flags} = this.parse(TestDialog)
        console.log(`Generating test .dialog in ${flags.output} from ${args.transcript} over ${args.dialog}`)
        if (flags.mock) {
            console.log(`  with HttpRequest mocking`)
        }
        if (flags.schema) {
            console.log(`  with schema ${flags.schema}`)
        }
        let success = await generateTest(args.transcript, args.dialog, flags.output, flags.mock, flags.schema)
        console.log(`Generated ${success}`)
        return success
    }
}
