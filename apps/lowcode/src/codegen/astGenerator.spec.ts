import type { ComponentModel } from '@/types';
import { describe, expect, it } from 'vitest';
import { generatePageAST } from './astGenerator';

function createTree(): ComponentModel {
    return {
        id: 'root',
        type: 'Container',
        name: 'Root',
        props: {},
        style: {},
        children: [
            {
                id: 't1',
                type: 'Text',
                name: 'Text',
                props: { value: 'Hello' },
                style: {},
                children: []
            }
        ]
    };
}

describe('astGenerator', () => {
    it('should generate AST and aggregate imports', () => {
        const tree = createTree();
        const { ast, context } = generatePageAST(tree, 'weapp');

        expect(ast.tagName).toBe('View');
        expect(ast.children[0].tagName).toBe('Text');

        const imports = context.imports['@tarojs/components'];
        expect(imports).toBeTruthy();
        expect(imports?.has('View')).toBe(true);
        expect(imports?.has('Text')).toBe(true);
    });
});
