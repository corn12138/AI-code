import type { ComponentModel } from '@/types';
import { describe, expect, it } from 'vitest';
import { generatePageAST } from './astGenerator';
import { generateComponentCode } from './templateGenerator';

function createTree(): ComponentModel {
    return {
        id: 'root',
        type: 'Container',
        name: 'Root',
        props: {},
        style: {},
        children: [
            { id: 't1', type: 'Text', name: 'Text', props: { value: 'Hello' }, style: {}, children: [] }
        ]
    };
}

describe('templateGenerator', () => {
    it('should generate imports and component boilerplate', () => {
        const { ast, context } = generatePageAST(createTree(), 'weapp');
        const code = generateComponentCode(ast, context, 'Index');

        expect(code).toContain("from '@tarojs/components'");
        expect(code).toMatch(/import\s+\{[^}]*Text[^}]*\}\s+from\s+'@tarojs\/components';/);
        expect(code).toMatch(/import\s+\{[^}]*View[^}]*\}\s+from\s+'@tarojs\/components';/);
        expect(code).toContain('const Index');
    });
});
