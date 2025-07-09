import { useEffect, useState } from 'react';

// 本地实现简单的防抖 hook
function useSimpleDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function SimpleDemo() {
    const [inputValue, setInputValue] = useState('');
    const [searchCount, setSearchCount] = useState(0);

    // 使用简单防抖，延迟 500ms
    const debouncedValue = useSimpleDebounce(inputValue, 500);

    // 模拟搜索API调用
    useEffect(() => {
        if (debouncedValue) {
            setSearchCount(prev => prev + 1);
            console.log('模拟API调用：', debouncedValue);
        }
    }, [debouncedValue]);

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', margin: '20px 0' }}>
            <h4>🔍 简单防抖演示</h4>
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="输入搜索关键词..."
                    style={{
                        width: '300px',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                <p><strong>实时输入值：</strong> {inputValue || '(空)'}</p>
                <p><strong>防抖后的值：</strong> {debouncedValue || '(空)'}</p>
                <p><strong>模拟API调用次数：</strong> {searchCount}</p>
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                💡 提示：快速输入文字，观察防抖效果！API调用只在停止输入500ms后触发。
            </div>
        </div>
    );
} 