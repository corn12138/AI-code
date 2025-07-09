# useForm

强大的表单状态管理 Hook，提供完整的表单状态管理、验证和提交处理功能。

## 基础用法

```javascript
import { useForm } from '@ai-code/hooks';

function LoginForm() {
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.email) {
        errors.email = '邮箱不能为空';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = '邮箱格式不正确';
      }
      
      if (!values.password) {
        errors.password = '密码不能为空';
      } else if (values.password.length < 6) {
        errors.password = '密码长度至少6位';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      console.log('提交数据:', values);
      // 调用登录 API
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        if (response.ok) {
          alert('登录成功！');
        } else {
          throw new Error('登录失败');
        }
      } catch (error) {
        alert('登录失败: ' + error.message);
      }
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input 
          {...form.getFieldProps('email')}
          type="email"
          placeholder="邮箱"
        />
        {form.touched.email && form.errors.email && (
          <div style={{color: 'red'}}>{form.errors.email}</div>
        )}
      </div>
      
      <div>
        <input 
          {...form.getFieldProps('password')}
          type="password"
          placeholder="密码"
        />
        {form.touched.password && form.errors.password && (
          <div style={{color: 'red'}}>{form.errors.password}</div>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={form.isSubmitting || !form.isValid}
      >
        {form.isSubmitting ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

## 高级用法

### 字段级验证

```javascript
import { useForm } from '@ai-code/hooks';

function RegistrationForm() {
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    // 字段级验证器
    fieldValidators: {
      username: (value) => {
        if (!value) return '用户名不能为空';
        if (value.length < 3) return '用户名至少3个字符';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '用户名只能包含字母、数字和下划线';
      },
      email: (value) => {
        if (!value) return '邮箱不能为空';
        if (!/\S+@\S+\.\S+/.test(value)) return '邮箱格式不正确';
      },
      password: (value) => {
        if (!value) return '密码不能为空';
        if (value.length < 8) return '密码至少8个字符';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return '密码必须包含大小写字母和数字';
        }
      },
      confirmPassword: (value, values) => {
        if (!value) return '请确认密码';
        if (value !== values.password) return '两次密码不一致';
      }
    },
    validateMode: 'onBlur', // 失焦时验证
    onSubmit: async (values) => {
      console.log('注册数据:', values);
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
      
      <div>
        <input {...form.getFieldProps('password')} type="password" placeholder="密码" />
        {form.touched.password && form.errors.password && (
          <div className="error">{form.errors.password}</div>
        )}
      </div>
      
      <div>
        <input {...form.getFieldProps('confirmPassword')} type="password" placeholder="确认密码" />
        {form.touched.confirmPassword && form.errors.confirmPassword && (
          <div className="error">{form.errors.confirmPassword}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

### 动态表单

```javascript
import { useForm } from '@ai-code/hooks';

function DynamicForm() {
  const form = useForm({
    initialValues: {
      name: '',
      contacts: [{ type: 'email', value: '' }]
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.name) {
        errors.name = '姓名不能为空';
      }
      
      // 验证联系方式
      if (values.contacts.some(contact => !contact.value)) {
        errors.contacts = '联系方式不能为空';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      console.log('提交:', values);
    }
  });

  const addContact = () => {
    const newContacts = [...form.values.contacts, { type: 'email', value: '' }];
    form.setFieldValue('contacts', newContacts);
  };

  const removeContact = (index) => {
    const newContacts = form.values.contacts.filter((_, i) => i !== index);
    form.setFieldValue('contacts', newContacts);
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...form.values.contacts];
    newContacts[index][field] = value;
    form.setFieldValue('contacts', newContacts);
  };

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input {...form.getFieldProps('name')} placeholder="姓名" />
        {form.touched.name && form.errors.name && (
          <div className="error">{form.errors.name}</div>
        )}
      </div>
      
      <div>
        <h3>联系方式</h3>
        {form.values.contacts.map((contact, index) => (
          <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <select 
              value={contact.type}
              onChange={(e) => updateContact(index, 'type', e.target.value)}
            >
              <option value="email">邮箱</option>
              <option value="phone">电话</option>
              <option value="wechat">微信</option>
            </select>
            
            <input 
              value={contact.value}
              onChange={(e) => updateContact(index, 'value', e.target.value)}
              placeholder="联系方式"
            />
            
            {form.values.contacts.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeContact(index)}
              >
                删除
              </button>
            )}
          </div>
        ))}
        
        <button type="button" onClick={addContact}>
          添加联系方式
        </button>
        
        {form.errors.contacts && (
          <div className="error">{form.errors.contacts}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        提交
      </button>
    </form>
  );
}
```

### 异步验证

```javascript
import { useForm } from '@ai-code/hooks';

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