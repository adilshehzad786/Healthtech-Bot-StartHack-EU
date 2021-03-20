/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable:no-console
// tslint:disable:no-object-literal-type-assertion

import { expect, test } from '@oclif/test';
import * as fs from 'fs-extra'
import 'mocha'
import * as os from 'os'
import * as ppath from 'path'

describe('dialog:generate', async () => {
    let output = ppath.join(os.tmpdir(), 'test.out')
    let schemaPath = '../library/test/forms/sandwich.form'
    let unitTestSchemaPath = '../library/test/forms/unittest_'
    let badSchema = '../library/test/forms/bad-schema.form'
    let swaggerPath = '../library/test/forms/petSwagger.json'
    let transcriptPath = '../library/test/transcripts/sandwich.transcript'
    let method = 'post'
    let route = '/store/order'
    let schemaName = 'petOrder.form'
    let unittestSchemaNames = [
        'age_with_units',
        'age',
        'array_enum',
        'array_personName',
        'boolean',
        'date-time',
        'date',
        'datetime',
        'dimension_with_units',
        'dimension',
        'email',
        'enum',
        'geography',
        'integer_with_limits',
        'integer',
        'iri',
        'keyPhrase_with_pattern',
        'keyPhrase',
        'money_with_units',
        'money',
        'multiple_enum',
        'multiple_string',
        'number_with_limits',
        'number',
        'ordinal',
        'percentage_with_limits',
        'percentage',
        'personName_with_pattern',
        'personName',
        'phonenumber',
        'string',
        'temperature_with_units',
        'temperature',
        'time',
        'uri'
    ]

    beforeEach(async () => {
        await fs.remove(output)
    })

    test
        .stdout()
        .stderr()
        .command(['dialog:generate', `${badSchema}`])
        .it('Detect bad schema', ctx => {
            expect(ctx.stderr)
                .to.contain('not a valid JSON Schema')
        })

    test
        .stdout()
        .stderr()
        .command(['dialog:generate', `${schemaPath}`, '-o', `${output}`, '--verbose'])
        .it('Generated successfully', ctx => {
            expect(ctx.stderr)
                .not.to.contain('Error')
        })

    for (let i = 0; i < unittestSchemaNames.length; i++) {
        test
            .stdout()
            .stderr()
            .command(['dialog:generate', `${unitTestSchemaPath}${unittestSchemaNames[i]}.form`, '-o', `${output}`, '--verbose'])
            .it(`Generated unit test schema ${unittestSchemaNames[i]} successfully`, ctx => {
                expect(ctx.stderr)
                    .not.to.contain('Error')
            })
    }

    test
        .stdout()
        .stderr()
        .command(['dialog:generate:test', `${transcriptPath}`, 'sandwich', '-o', output])
        .it('Generate test .dialog', ctx => {
            expect(ctx.stdout)
                .to.contain('Generated')
        })

    test
        .stdout()
        .stderr()
        .command(['dialog:generate:swagger', `${swaggerPath}`,
            '-o', `${output}`,
            '-m', `${method}`,
            '-n', `${schemaName}`,
            '-r', `${route}`,
            '--verbose'])
        .it('Generate swagger', ctx => {
            expect(ctx.stderr).to.contain('Output Schema')
        })
})
