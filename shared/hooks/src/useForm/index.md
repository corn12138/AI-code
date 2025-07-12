# useForm

用于表单处理的 React Hook。

## 基本用法

```tsx
import { useForm } from '@corn12138/hooks';

function ContactForm() {
  const { values, errors, handleChange, handleSubmit } = useForm({
    name: '',
    email: '',
    message: ''
  });
  
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
        placeholder="Your Name"
      />
      {errors.name && <span>{errors.name}</span>}
      
      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Your Email"
      />
      {errors.email && <span>{errors.email}</span>}
      
      <textarea
        name="message"
        value={values.message}
        onChange={handleChange}
        placeholder="Your Message"
      />
      {errors.message && <span>{errors.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 带验证的表单

```tsx
import { useForm } from '@corn12138/hooks';

function ValidatedForm() {
  const { values, errors, handleChange, handleSubmit, isValid } = useForm({
    email: '',
    password: ''
  }, {
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
      }
    }
  });
  
  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit" disabled={!isValid}>
        Login
      </button>
    </form>
  );
}
```

## 复杂表单

```tsx
import { useForm } from '@corn12138/hooks';

function ComplexForm() {
  const { values, handleChange, handleSubmit, reset } = useForm({
    profile: {
      firstName: '',
      lastName: '',
      age: ''
    },
    preferences: {
      theme: 'light',
      notifications: true
    }
  });
  
  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <h2>Profile</h2>
      <input
        name="profile.firstName"
        value={values.profile.firstName}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        name="profile.lastName"
        value={values.profile.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        name="profile.age"
        type="number"
        value={values.profile.age}
        onChange={handleChange}
        placeholder="Age"
      />
      
      <h2>Preferences</h2>
      <select
        name="preferences.theme"
        value={values.preferences.theme}
        onChange={handleChange}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      
      <label>
        <input
          name="preferences.notifications"
          type="checkbox"
          checked={values.preferences.notifications}
          onChange={handleChange}
        />
        Enable notifications
      </label>
      
      <button type="submit">Save</button>
      <button type="button" onClick={reset}>Reset</button>
    </form>
  );
}
```

## 动态表单

```tsx
import { useForm } from '@corn12138/hooks';

function DynamicForm() {
  const { values, handleChange, handleSubmit, setValues } = useForm({
    items: [{ name: '', quantity: 1 }]
  });
  
  const addItem = () => {
    setValues(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1 }]
    }));
  };
  
  const removeItem = (index) => {
    setValues(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <form onSubmit={handleSubmit(handleSave)}>
      {values.items.map((item, index) => (
        <div key={index}>
          <input
            name={`items.${index}.name`}
            value={item.name}
            onChange={handleChange}
            placeholder="Item name"
          />
          <input
            name={`items.${index}.quantity`}
            type="number"
            value={item.quantity}
            onChange={handleChange}
            min="1"
          />
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      
      <button type="button" onClick={addItem}>
        Add Item
      </button>
      <button type="submit">Save</button>
    </form>
  );
}
```

### 异步验证

```javascript
import { useForm } from '@corn12138/hooks';

function UserForm() {
  const form = useForm({
    initialValues: {
      username: '',
      email: ''
    },
    fieldValidators: {
      username: async (value) => {
        if (!value) return '用户名不能为空';
        
        // 模拟异步验证用户名是否已存在
        try {
          const response = await fetch(`/api/check-username?username=${value}`);
          const data = await response.json();
          
          if (data.exists) {
            return '用户名已存在';
          }
        } catch (error) {
          return '验证用户名时出错';
        }
      },
      email: async (value) => {
        if (!value) return '邮箱不能为空';
        if (!/\S+@\S+\.\S+/.test(value)) return '邮箱格式不正确';
        
        // 异步验证邮箱
        try {
          const response = await fetch(`/api/check-email?email=${value}`);
          const data = await response.json();
          
          if (data.exists) {
            return '邮箱已被注册';
          }
        } catch (error) {
          return '验证邮箱时出错';
        }
      }
    },
    validateMode: 'onBlur',
    onSubmit: async (values) => {
      console.log('提交:', values);
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input {...form.getFieldProps('username')} placeholder="用户名" />
        {form.touched.username && form.errors.username && (
          <div className="error">{form.errors.username}</div>
        )}
      </div>
      
      <div>
        <input {...form.getFieldProps('email')} placeholder="邮箱" />
        {form.touched.email && form.errors.email && (
          <div className="error">{form.errors.email}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        提交
      </button>
    </form>
  );
}
```

## API

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| options | `UseFormOptions<T>` | ✅ | 表单配置选项 |

### UseFormOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| initialValues | `T` | - | 表单初始值 |
| validate | `(values: T) => Record<keyof T, string>` | - | 表单级验证函数 |
| fieldValidators | `Record<keyof T, Function>` | - | 字段级验证函数映射 |
| onSubmit | `(values: T) => void \| Promise<void>` | - | 表单提交处理函数 |
| validateMode | `'onChange' \| 'onBlur' \| 'onSubmit'` | `'onSubmit'` | 验证触发模式 |
| reValidateMode | `'onChange' \| 'onBlur' \| 'onSubmit'` | `'onChange'` | 重新验证模式 |
| focusFirstError | `boolean` | `true` | 是否自动聚焦第一个错误字段 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| values | `T` | 表单当前值 |
| errors | `Partial<Record<keyof T, string>>` | 表单验证错误 |
| touched | `Partial<Record<keyof T, boolean>>` | 字段触摸状态 |
| isSubmitting | `boolean` | 是否正在提交 |
| isValid | `boolean` | 表单是否有效 |
| isDirty | `boolean` | 表单是否已修改 |
| isValidated | `boolean` | 是否已验证过 |

### 方法

| 方法 | 类型 | 描述 |
|------|------|------|
| setFieldValue | `(name: keyof T, value: any) => void` | 设置单个字段值 |
| setValues | `(values: Partial<T>) => void` | 批量设置字段值 |
| setFieldError | `(name: keyof T, error: string) => void` | 设置字段错误 |
| setErrors | `(errors: Record<keyof T, string>) => void` | 批量设置错误 |
| clearErrors | `() => void` | 清除所有错误 |
| setFieldTouched | `(name: keyof T, touched?: boolean) => void` | 设置字段触摸状态 |
| handleChange | `(e: ChangeEvent) => void` | 处理输入变化 |
| handleBlur | `(e: FocusEvent) => void` | 处理输入失焦 |
| handleSubmit | `(e?: FormEvent) => void` | 处理表单提交 |
| validateField | `(name: keyof T) => Promise<string \| undefined>` | 验证单个字段 |
| validateForm | `() => Promise<Record<keyof T, string>>` | 验证整个表单 |
| reset | `() => void` | 重置表单 |
| getFieldProps | `(name: keyof T) => FieldProps` | 获取字段属性 |

## 最佳实践

### 1. 类型安全

```javascript
// 定义表单数据类型
interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function ContactFormComponent() {
  const form = useForm<ContactForm>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: ''
    },
    // TypeScript 会提供完整的类型检查
    validate: (values) => {
      const errors: Partial<Record<keyof ContactForm, string>> = {};
      // 验证逻辑...
      return errors;
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}
```

### 2. 错误处理

```javascript
const form = useForm({
  initialValues: { email: '', password: '' },
  onSubmit: async (values) => {
    try {
      await loginUser(values);
      // 成功处理
    } catch (error) {
      // 设置服务器错误
      if (error.field) {
        form.setFieldError(error.field, error.message);
      } else {
        form.setErrors({ 
          email: '登录失败，请检查邮箱和密码' 
        });
      }
    }
  }
});
```

### 3. 表单重置

```javascript
function EditProfileForm({ user }) {
  const form = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || ''
    },
    onSubmit: async (values) => {
      await updateProfile(values);
      // 可以选择是否重置表单
      // form.reset();
    }
  });

  // 当用户数据变化时重新初始化表单
  useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        email: user.email,
        bio: user.bio
      });
    }
  }, [user]);

  return (
    <form onSubmit={form.handleSubmit}>
      {/* 表单内容 */}
      <button type="button" onClick={form.reset}>
        重置
      </button>
    </form>
  );
}
```

## 注意事项

1. **验证模式**：
   - `onChange`: 每次输入都验证，实时反馈但可能影响性能
   - `onBlur`: 失焦时验证，平衡用户体验和性能
   - `onSubmit`: 提交时验证，最少的验证次数

2. **异步验证**：字段级验证支持异步函数，但要注意防抖处理

3. **性能优化**：大型表单建议使用 `onBlur` 或 `onSubmit` 验证模式

4. **错误聚焦**：默认会自动聚焦到第一个错误字段，可通过 `focusFirstError` 控制

5. **表单重置**：`reset()` 会将表单恢复到初始状态，包括清除错误和触摸状态 