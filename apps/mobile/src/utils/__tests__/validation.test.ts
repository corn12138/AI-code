import { describe, expect, it } from 'vitest';
import {
    validateChineseName,
    validateDate,
    validateEmail,
    validateIdCard,
    validateLength,
    validateNumber,
    validatePassword,
    validatePhone,
    validateRequired,
    validateUrl
} from '../validation';

describe('Validation工具函数', () => {
    describe('validateEmail', () => {
        it('应该验证有效的邮箱地址', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
            expect(validateEmail('123@test.org')).toBe(true);
        });

        it('应该拒绝无效的邮箱地址', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test@.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail('test space@example.com')).toBe(false);
        });

        it('应该处理边界情况', () => {
            expect(validateEmail(null)).toBe(false);
            expect(validateEmail(undefined)).toBe(false);
            expect(validateEmail(123)).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('应该验证有效的密码', () => {
            expect(validatePassword('password123')).toBe(true);
            expect(validatePassword('MyPass123!')).toBe(true);
            expect(validatePassword('12345678')).toBe(true);
        });

        it('应该拒绝过短的密码', () => {
            expect(validatePassword('123')).toBe(false);
            expect(validatePassword('pass')).toBe(false);
            expect(validatePassword('')).toBe(false);
        });

        it('应该处理特殊字符', () => {
            expect(validatePassword('pass@word123')).toBe(true);
            expect(validatePassword('密码123')).toBe(true);
        });
    });

    describe('validatePhone', () => {
        it('应该验证有效的手机号码', () => {
            expect(validatePhone('13800138000')).toBe(true);
            expect(validatePhone('15912345678')).toBe(true);
            expect(validatePhone('18612345678')).toBe(true);
        });

        it('应该拒绝无效的手机号码', () => {
            expect(validatePhone('1234567890')).toBe(false);
            expect(validatePhone('1380013800')).toBe(false);
            expect(validatePhone('138001380000')).toBe(false);
            expect(validatePhone('')).toBe(false);
            expect(validatePhone('abc12345678')).toBe(false);
        });

        it('应该处理带格式的手机号', () => {
            expect(validatePhone('138-0013-8000')).toBe(true);
            expect(validatePhone('138 0013 8000')).toBe(true);
        });
    });

    describe('validateRequired', () => {
        it('应该验证非空值', () => {
            expect(validateRequired('test')).toBe(true);
            expect(validateRequired('0')).toBe(true);
            expect(validateRequired(0)).toBe(true);
            expect(validateRequired(false)).toBe(true);
        });

        it('应该拒绝空值', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
            expect(validateRequired([])).toBe(false);
            expect(validateRequired({})).toBe(false);
        });

        it('应该处理空白字符串', () => {
            expect(validateRequired('   ')).toBe(false);
            expect(validateRequired('\t\n')).toBe(false);
        });
    });

    describe('validateLength', () => {
        it('应该验证字符串长度', () => {
            expect(validateLength('test', 4, 4)).toBe(true);
            expect(validateLength('hello', 1, 10)).toBe(true);
            expect(validateLength('', 0, 5)).toBe(true);
        });

        it('应该拒绝长度不符合要求的字符串', () => {
            expect(validateLength('test', 5, 10)).toBe(false);
            expect(validateLength('hello world', 1, 5)).toBe(false);
            expect(validateLength('', 1, 5)).toBe(false);
        });

        it('应该处理边界值', () => {
            expect(validateLength('test', 4, 4)).toBe(true);
            expect(validateLength('test', 3, 5)).toBe(true);
        });
    });

    describe('validateUrl', () => {
        it('应该验证有效的URL', () => {
            expect(validateUrl('https://example.com')).toBe(true);
            expect(validateUrl('http://test.org/path')).toBe(true);
            expect(validateUrl('https://sub.domain.co.uk/path?param=value')).toBe(true);
        });

        it('应该拒绝无效的URL', () => {
            expect(validateUrl('not-a-url')).toBe(false);
            expect(validateUrl('ftp://example.com')).toBe(false);
            expect(validateUrl('')).toBe(false);
            expect(validateUrl('http://')).toBe(false);
        });

        it('应该处理相对URL', () => {
            expect(validateUrl('/path/to/page')).toBe(false);
            expect(validateUrl('page.html')).toBe(false);
        });
    });

    describe('validateNumber', () => {
        it('应该验证有效的数字', () => {
            expect(validateNumber('123')).toBe(true);
            expect(validateNumber('0')).toBe(true);
            expect(validateNumber('-123')).toBe(true);
            expect(validateNumber('123.45')).toBe(true);
        });

        it('应该拒绝无效的数字', () => {
            expect(validateNumber('abc')).toBe(false);
            expect(validateNumber('12a34')).toBe(false);
            expect(validateNumber('')).toBe(false);
            expect(validateNumber('123.45.67')).toBe(false);
        });

        it('应该处理边界值', () => {
            expect(validateNumber('0')).toBe(true);
            expect(validateNumber('-0')).toBe(true);
        });
    });

    describe('validateDate', () => {
        it('应该验证有效的日期格式', () => {
            expect(validateDate('2023-12-25')).toBe(true);
            expect(validateDate('2023/12/25')).toBe(true);
            expect(validateDate('2023.12.25')).toBe(true);
        });

        it('应该拒绝无效的日期格式', () => {
            expect(validateDate('2023-13-01')).toBe(false);
            expect(validateDate('2023-12-32')).toBe(false);
            expect(validateDate('invalid-date')).toBe(false);
            expect(validateDate('')).toBe(false);
        });

        it('应该处理边界日期', () => {
            expect(validateDate('2023-12-31')).toBe(true);
            expect(validateDate('2023-01-01')).toBe(true);
        });
    });

    describe('validateIdCard', () => {
        it('应该验证有效的身份证号', () => {
            expect(validateIdCard('110101199001011234')).toBe(true);
            expect(validateIdCard('11010119900101123X')).toBe(true);
        });

        it('应该拒绝无效的身份证号', () => {
            expect(validateIdCard('123456789012345')).toBe(false);
            expect(validateIdCard('11010119900101123')).toBe(false);
            expect(validateIdCard('11010119900101123Y')).toBe(false);
            expect(validateIdCard('')).toBe(false);
        });

        it('应该处理格式问题', () => {
            expect(validateIdCard('110101 19900101 1234')).toBe(false);
            expect(validateIdCard('110101-19900101-1234')).toBe(false);
        });
    });

    describe('validateChineseName', () => {
        it('应该验证有效的中文姓名', () => {
            expect(validateChineseName('张三')).toBe(true);
            expect(validateChineseName('李四')).toBe(true);
            expect(validateChineseName('王五')).toBe(true);
        });

        it('应该拒绝无效的中文姓名', () => {
            expect(validateChineseName('John')).toBe(false);
            expect(validateChineseName('123')).toBe(false);
            expect(validateChineseName('')).toBe(false);
            expect(validateChineseName('张')).toBe(false);
        });

        it('应该处理特殊字符', () => {
            expect(validateChineseName('张·李')).toBe(false);
            expect(validateChineseName('张 三')).toBe(false);
        });
    });

    describe('组合验证', () => {
        it('应该支持多个验证规则组合', () => {
            const email = 'test@example.com';
            const password = 'password123';

            expect(validateEmail(email) && validatePassword(password)).toBe(true);
        });

        it('应该处理复杂的验证场景', () => {
            const userData = {
                email: 'user@example.com',
                phone: '13800138000',
                name: '张三',
                password: 'MyPass123!'
            };

            const isValid =
                validateEmail(userData.email) &&
                validatePhone(userData.phone) &&
                validateChineseName(userData.name) &&
                validatePassword(userData.password);

            expect(isValid).toBe(true);
        });
    });
});
