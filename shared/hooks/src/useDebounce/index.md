# useDebounce

防抖Hook，用于延迟执行值的更新或回调函数。

## useDebounce

延迟更新值，常用于搜索输入等场景。

```javascript
import { useState, useEffect } from 'react';
import { useDebounce } from '@ai-code/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 只有当用户停止输入500ms后才会触发搜索
  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      console.log('搜索:', debouncedSearchTerm);
      // 这里可以调用实际的搜索API
      // fetch(`/api/search?q=${debouncedSearchTerm}`)
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

## useDebouncedCallback

防抖回调函数。

```javascript
import { useDebouncedCallback } from '@ai-code/hooks';

function FormComponent() {
  const debouncedSave = useDebouncedCallback(
    (formData) => {
      // 保存表单数据
      console.log('保存表单数据:', formData);
      // 这里可以调用实际的保存API
      // fetch('/api/save', { method: 'POST', body: JSON.stringify(formData) })
    },
    1000
  );

  return (
    <form>
      <input onChange={(e) => debouncedSave({ field: e.target.value })} />
    </form>
  );
}
```

## API

### useDebounce

| 参数 | 类型 | 描述 |
|------|------|------|
| value | T | 需要防抖的值 |
| delay | number | 延迟时间（毫秒） |

### useDebouncedCallback

| 参数 | 类型 | 描述 |
|------|------|------|
| callback | Function | 需要防抖的回调函数 |
| delay | number | 延迟时间（毫秒） |
| deps | Array | 依赖数组 | 