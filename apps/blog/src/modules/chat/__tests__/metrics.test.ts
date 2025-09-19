import { describe, expect, it } from 'vitest';
import { calculateCost, estimateTokens, getModelProvider } from '../../server/metrics';
import { createConversationTitle } from '../../server/chatService';

describe('chat metrics helpers', () => {
    it('estimates tokens using a 4 char bucket', () => {
        expect(estimateTokens('')).toBe(0);
        expect(estimateTokens('abcd')).toBe(1);
        expect(estimateTokens('abcdefgh')).toBe(2);
        expect(estimateTokens('abcdefghi')).toBe(3);
    });

    it('calculates costs with model specific pricing', () => {
        const value = calculateCost('qwen/qwen2.5-7b-instruct/bf-16', 1000, 2000);
        expect(value).toBeCloseTo(0.0003);

        const fallback = calculateCost('unknown-model', 1000, 1000);
        expect(fallback).toBeCloseTo(0.0002);
    });

    it('resolves model providers from model name', () => {
        expect(getModelProvider('qwen/whatever')).toBe('alibaba');
        expect(getModelProvider('google/gemma-3-27b-instruct/bf-16')).toBe('google');
        expect(getModelProvider('gpt-4-turbo')).toBe('openai');
        expect(getModelProvider('custom-model')).toBe('unknown');
    });

    it('creates readable conversation titles', () => {
        expect(createConversationTitle('')).toBe('新对话');
        expect(createConversationTitle('Hello world')).toBe('Hello world');
        expect(createConversationTitle('a'.repeat(80))).toMatch(/\.\.\.$/);
        expect(createConversationTitle('a'.repeat(80)).length).toBeLessThanOrEqual(53);
    });
});
