'use strict';

const { describe, test, expect } = require('bun:test');
const naming = require('../../src/core/naming.js');

describe('core/naming', () => {
    test('sub_part 默认名使用 context.namespace', () => {
        expect(naming.generateDefaultName('sub_part', { namespace: 'acme' }))
            .toBe('sub_part.acme.main');
        expect(naming.generateDefaultName('sub_part', {}))
            .toBe('sub_part.machine_max.main');
    });

    test('保留信号名只有 local / global', () => {
        const variant = { sub_parts: {} };
        for (const name of ['local', 'global']) {
            expect(naming.validateNameUniqueness(variant, 'connector', 'sp', name).valid)
                .toBe(false);
        }
        for (const name of ['subpart', 'vehicle']) {
            expect(naming.validateNameUniqueness(variant, 'connector', 'sp', name).valid)
                .toBe(true);
        }
    });
});
