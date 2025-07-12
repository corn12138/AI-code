# useDebounce

用于防抖处理的 React Hook。

## 基本用法

```tsx
import { useDebounce } from '@corn12138/hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索请求
      console.log('搜索:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="输入搜索内容..."
    />
  );
}
```

## 防抖回调

```tsx
import { useDebouncedCallback } from '@corn12138/hooks';

function FormComponent() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const debouncedSave = useDebouncedCallback((data) => {
    // 自动保存表单数据
    console.log('保存表单:', data);
  }, 1000);
  
  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(newData);
  };
  
  return (
    <form>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="姓名"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="邮箱"
      />
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