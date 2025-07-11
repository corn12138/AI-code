"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[333],{55944:function(o,e,n){n.r(e),n.d(e,{demos:function(){return r}});var a=n(44194),r={}},15882:function(o,e,n){n.r(e),n.d(e,{texts:function(){return a}});const a=[{value:"\u5F3A\u5927\u7684\u8868\u5355\u72B6\u6001\u7BA1\u7406 Hook\uFF0C\u63D0\u4F9B\u5B8C\u6574\u7684\u8868\u5355\u72B6\u6001\u7BA1\u7406\u3001\u9A8C\u8BC1\u548C\u63D0\u4EA4\u5904\u7406\u529F\u80FD\u3002",paraId:0,tocIndex:0},{value:`import { useForm } from '@ai-code/hooks';

function LoginForm() {
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.email) {
        errors.email = '\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A';
      } else if (!/\\S+@\\S+\\.\\S+/.test(values.email)) {
        errors.email = '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E';
      }
      
      if (!values.password) {
        errors.password = '\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A';
      } else if (values.password.length < 6) {
        errors.password = '\u5BC6\u7801\u957F\u5EA6\u81F3\u5C116\u4F4D';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      console.log('\u63D0\u4EA4\u6570\u636E:', values);
      // \u8C03\u7528\u767B\u5F55 API
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        if (response.ok) {
          alert('\u767B\u5F55\u6210\u529F\uFF01');
        } else {
          throw new Error('\u767B\u5F55\u5931\u8D25');
        }
      } catch (error) {
        alert('\u767B\u5F55\u5931\u8D25: ' + error.message);
      }
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input 
          {...form.getFieldProps('email')}
          type="email"
          placeholder="\u90AE\u7BB1"
        />
        {form.touched.email && form.errors.email && (
          <div style={{color: 'red'}}>{form.errors.email}</div>
        )}
      </div>
      
      <div>
        <input 
          {...form.getFieldProps('password')}
          type="password"
          placeholder="\u5BC6\u7801"
        />
        {form.touched.password && form.errors.password && (
          <div style={{color: 'red'}}>{form.errors.password}</div>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={form.isSubmitting || !form.isValid}
      >
        {form.isSubmitting ? '\u767B\u5F55\u4E2D...' : '\u767B\u5F55'}
      </button>
    </form>
  );
}
`,paraId:1,tocIndex:1},{value:`import { useForm } from '@ai-code/hooks';

function RegistrationForm() {
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    // \u5B57\u6BB5\u7EA7\u9A8C\u8BC1\u5668
    fieldValidators: {
      username: (value) => {
        if (!value) return '\u7528\u6237\u540D\u4E0D\u80FD\u4E3A\u7A7A';
        if (value.length < 3) return '\u7528\u6237\u540D\u81F3\u5C113\u4E2A\u5B57\u7B26';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '\u7528\u6237\u540D\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u4E0B\u5212\u7EBF';
      },
      email: (value) => {
        if (!value) return '\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A';
        if (!/\\S+@\\S+\\.\\S+/.test(value)) return '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E';
      },
      password: (value) => {
        if (!value) return '\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A';
        if (value.length < 8) return '\u5BC6\u7801\u81F3\u5C118\u4E2A\u5B57\u7B26';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(value)) {
          return '\u5BC6\u7801\u5FC5\u987B\u5305\u542B\u5927\u5C0F\u5199\u5B57\u6BCD\u548C\u6570\u5B57';
        }
      },
      confirmPassword: (value, values) => {
        if (!value) return '\u8BF7\u786E\u8BA4\u5BC6\u7801';
        if (value !== values.password) return '\u4E24\u6B21\u5BC6\u7801\u4E0D\u4E00\u81F4';
      }
    },
    validateMode: 'onBlur', // \u5931\u7126\u65F6\u9A8C\u8BC1
    onSubmit: async (values) => {
      console.log('\u6CE8\u518C\u6570\u636E:', values);
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input {...form.getFieldProps('username')} placeholder="\u7528\u6237\u540D" />
        {form.touched.username && form.errors.username && (
          <div className="error">{form.errors.username}</div>
        )}
      </div>
      
      <div>
        <input {...form.getFieldProps('email')} placeholder="\u90AE\u7BB1" />
        {form.touched.email && form.errors.email && (
          <div className="error">{form.errors.email}</div>
        )}
      </div>
      
      <div>
        <input {...form.getFieldProps('password')} type="password" placeholder="\u5BC6\u7801" />
        {form.touched.password && form.errors.password && (
          <div className="error">{form.errors.password}</div>
        )}
      </div>
      
      <div>
        <input {...form.getFieldProps('confirmPassword')} type="password" placeholder="\u786E\u8BA4\u5BC6\u7801" />
        {form.touched.confirmPassword && form.errors.confirmPassword && (
          <div className="error">{form.errors.confirmPassword}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? '\u6CE8\u518C\u4E2D...' : '\u6CE8\u518C'}
      </button>
    </form>
  );
}
`,paraId:2,tocIndex:3},{value:`import { useForm } from '@ai-code/hooks';

function DynamicForm() {
  const form = useForm({
    initialValues: {
      name: '',
      contacts: [{ type: 'email', value: '' }]
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.name) {
        errors.name = '\u59D3\u540D\u4E0D\u80FD\u4E3A\u7A7A';
      }
      
      // \u9A8C\u8BC1\u8054\u7CFB\u65B9\u5F0F
      if (values.contacts.some(contact => !contact.value)) {
        errors.contacts = '\u8054\u7CFB\u65B9\u5F0F\u4E0D\u80FD\u4E3A\u7A7A';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      console.log('\u63D0\u4EA4:', values);
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
        <input {...form.getFieldProps('name')} placeholder="\u59D3\u540D" />
        {form.touched.name && form.errors.name && (
          <div className="error">{form.errors.name}</div>
        )}
      </div>
      
      <div>
        <h3>\u8054\u7CFB\u65B9\u5F0F</h3>
        {form.values.contacts.map((contact, index) => (
          <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <select 
              value={contact.type}
              onChange={(e) => updateContact(index, 'type', e.target.value)}
            >
              <option value="email">\u90AE\u7BB1</option>
              <option value="phone">\u7535\u8BDD</option>
              <option value="wechat">\u5FAE\u4FE1</option>
            </select>
            
            <input 
              value={contact.value}
              onChange={(e) => updateContact(index, 'value', e.target.value)}
              placeholder="\u8054\u7CFB\u65B9\u5F0F"
            />
            
            {form.values.contacts.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeContact(index)}
              >
                \u5220\u9664
              </button>
            )}
          </div>
        ))}
        
        <button type="button" onClick={addContact}>
          \u6DFB\u52A0\u8054\u7CFB\u65B9\u5F0F
        </button>
        
        {form.errors.contacts && (
          <div className="error">{form.errors.contacts}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        \u63D0\u4EA4
      </button>
    </form>
  );
}
`,paraId:3,tocIndex:4},{value:`import { useForm } from '@ai-code/hooks';

function UserForm() {
  const form = useForm({
    initialValues: {
      username: '',
      email: ''
    },
    fieldValidators: {
      username: async (value) => {
        if (!value) return '\u7528\u6237\u540D\u4E0D\u80FD\u4E3A\u7A7A';
        
        // \u6A21\u62DF\u5F02\u6B65\u9A8C\u8BC1\u7528\u6237\u540D\u662F\u5426\u5DF2\u5B58\u5728
        try {
          const response = await fetch(\`/api/check-username?username=\${value}\`);
          const data = await response.json();
          
          if (data.exists) {
            return '\u7528\u6237\u540D\u5DF2\u5B58\u5728';
          }
        } catch (error) {
          return '\u9A8C\u8BC1\u7528\u6237\u540D\u65F6\u51FA\u9519';
        }
      },
      email: async (value) => {
        if (!value) return '\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A';
        if (!/\\S+@\\S+\\.\\S+/.test(value)) return '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E';
        
        // \u5F02\u6B65\u9A8C\u8BC1\u90AE\u7BB1
        try {
          const response = await fetch(\`/api/check-email?email=\${value}\`);
          const data = await response.json();
          
          if (data.exists) {
            return '\u90AE\u7BB1\u5DF2\u88AB\u6CE8\u518C';
          }
        } catch (error) {
          return '\u9A8C\u8BC1\u90AE\u7BB1\u65F6\u51FA\u9519';
        }
      }
    },
    validateMode: 'onBlur',
    onSubmit: async (values) => {
      console.log('\u63D0\u4EA4:', values);
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input {...form.getFieldProps('username')} placeholder="\u7528\u6237\u540D" />
        {form.touched.username && form.errors.username && (
          <div className="error">{form.errors.username}</div>
        )}
      </div>
      
      <div>
        <input {...form.getFieldProps('email')} placeholder="\u90AE\u7BB1" />
        {form.touched.email && form.errors.email && (
          <div className="error">{form.errors.email}</div>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        \u63D0\u4EA4
      </button>
    </form>
  );
}
`,paraId:4,tocIndex:5},{value:"\u53C2\u6570",paraId:5,tocIndex:7},{value:"\u7C7B\u578B",paraId:5,tocIndex:7},{value:"\u5FC5\u586B",paraId:5,tocIndex:7},{value:"\u63CF\u8FF0",paraId:5,tocIndex:7},{value:"options",paraId:5,tocIndex:7},{value:"UseFormOptions<T>",paraId:5,tocIndex:7},{value:"\u2705",paraId:5,tocIndex:7},{value:"\u8868\u5355\u914D\u7F6E\u9009\u9879",paraId:5,tocIndex:7},{value:"\u5C5E\u6027",paraId:6,tocIndex:8},{value:"\u7C7B\u578B",paraId:6,tocIndex:8},{value:"\u9ED8\u8BA4\u503C",paraId:6,tocIndex:8},{value:"\u63CF\u8FF0",paraId:6,tocIndex:8},{value:"initialValues",paraId:6,tocIndex:8},{value:"T",paraId:6,tocIndex:8},{value:"-",paraId:6,tocIndex:8},{value:"\u8868\u5355\u521D\u59CB\u503C",paraId:6,tocIndex:8},{value:"validate",paraId:6,tocIndex:8},{value:"(values: T) => Record<keyof T, string>",paraId:6,tocIndex:8},{value:"-",paraId:6,tocIndex:8},{value:"\u8868\u5355\u7EA7\u9A8C\u8BC1\u51FD\u6570",paraId:6,tocIndex:8},{value:"fieldValidators",paraId:6,tocIndex:8},{value:"Record<keyof T, Function>",paraId:6,tocIndex:8},{value:"-",paraId:6,tocIndex:8},{value:"\u5B57\u6BB5\u7EA7\u9A8C\u8BC1\u51FD\u6570\u6620\u5C04",paraId:6,tocIndex:8},{value:"onSubmit",paraId:6,tocIndex:8},{value:"(values: T) => void | Promise<void>",paraId:6,tocIndex:8},{value:"-",paraId:6,tocIndex:8},{value:"\u8868\u5355\u63D0\u4EA4\u5904\u7406\u51FD\u6570",paraId:6,tocIndex:8},{value:"validateMode",paraId:6,tocIndex:8},{value:"'onChange' | 'onBlur' | 'onSubmit'",paraId:6,tocIndex:8},{value:"'onSubmit'",paraId:6,tocIndex:8},{value:"\u9A8C\u8BC1\u89E6\u53D1\u6A21\u5F0F",paraId:6,tocIndex:8},{value:"reValidateMode",paraId:6,tocIndex:8},{value:"'onChange' | 'onBlur' | 'onSubmit'",paraId:6,tocIndex:8},{value:"'onChange'",paraId:6,tocIndex:8},{value:"\u91CD\u65B0\u9A8C\u8BC1\u6A21\u5F0F",paraId:6,tocIndex:8},{value:"focusFirstError",paraId:6,tocIndex:8},{value:"boolean",paraId:6,tocIndex:8},{value:"true",paraId:6,tocIndex:8},{value:"\u662F\u5426\u81EA\u52A8\u805A\u7126\u7B2C\u4E00\u4E2A\u9519\u8BEF\u5B57\u6BB5",paraId:6,tocIndex:8},{value:"\u5C5E\u6027",paraId:7,tocIndex:9},{value:"\u7C7B\u578B",paraId:7,tocIndex:9},{value:"\u63CF\u8FF0",paraId:7,tocIndex:9},{value:"values",paraId:7,tocIndex:9},{value:"T",paraId:7,tocIndex:9},{value:"\u8868\u5355\u5F53\u524D\u503C",paraId:7,tocIndex:9},{value:"errors",paraId:7,tocIndex:9},{value:"Partial<Record<keyof T, string>>",paraId:7,tocIndex:9},{value:"\u8868\u5355\u9A8C\u8BC1\u9519\u8BEF",paraId:7,tocIndex:9},{value:"touched",paraId:7,tocIndex:9},{value:"Partial<Record<keyof T, boolean>>",paraId:7,tocIndex:9},{value:"\u5B57\u6BB5\u89E6\u6478\u72B6\u6001",paraId:7,tocIndex:9},{value:"isSubmitting",paraId:7,tocIndex:9},{value:"boolean",paraId:7,tocIndex:9},{value:"\u662F\u5426\u6B63\u5728\u63D0\u4EA4",paraId:7,tocIndex:9},{value:"isValid",paraId:7,tocIndex:9},{value:"boolean",paraId:7,tocIndex:9},{value:"\u8868\u5355\u662F\u5426\u6709\u6548",paraId:7,tocIndex:9},{value:"isDirty",paraId:7,tocIndex:9},{value:"boolean",paraId:7,tocIndex:9},{value:"\u8868\u5355\u662F\u5426\u5DF2\u4FEE\u6539",paraId:7,tocIndex:9},{value:"isValidated",paraId:7,tocIndex:9},{value:"boolean",paraId:7,tocIndex:9},{value:"\u662F\u5426\u5DF2\u9A8C\u8BC1\u8FC7",paraId:7,tocIndex:9},{value:"\u65B9\u6CD5",paraId:8,tocIndex:10},{value:"\u7C7B\u578B",paraId:8,tocIndex:10},{value:"\u63CF\u8FF0",paraId:8,tocIndex:10},{value:"setFieldValue",paraId:8,tocIndex:10},{value:"(name: keyof T, value: any) => void",paraId:8,tocIndex:10},{value:"\u8BBE\u7F6E\u5355\u4E2A\u5B57\u6BB5\u503C",paraId:8,tocIndex:10},{value:"setValues",paraId:8,tocIndex:10},{value:"(values: Partial<T>) => void",paraId:8,tocIndex:10},{value:"\u6279\u91CF\u8BBE\u7F6E\u5B57\u6BB5\u503C",paraId:8,tocIndex:10},{value:"setFieldError",paraId:8,tocIndex:10},{value:"(name: keyof T, error: string) => void",paraId:8,tocIndex:10},{value:"\u8BBE\u7F6E\u5B57\u6BB5\u9519\u8BEF",paraId:8,tocIndex:10},{value:"setErrors",paraId:8,tocIndex:10},{value:"(errors: Record<keyof T, string>) => void",paraId:8,tocIndex:10},{value:"\u6279\u91CF\u8BBE\u7F6E\u9519\u8BEF",paraId:8,tocIndex:10},{value:"clearErrors",paraId:8,tocIndex:10},{value:"() => void",paraId:8,tocIndex:10},{value:"\u6E05\u9664\u6240\u6709\u9519\u8BEF",paraId:8,tocIndex:10},{value:"setFieldTouched",paraId:8,tocIndex:10},{value:"(name: keyof T, touched?: boolean) => void",paraId:8,tocIndex:10},{value:"\u8BBE\u7F6E\u5B57\u6BB5\u89E6\u6478\u72B6\u6001",paraId:8,tocIndex:10},{value:"handleChange",paraId:8,tocIndex:10},{value:"(e: ChangeEvent) => void",paraId:8,tocIndex:10},{value:"\u5904\u7406\u8F93\u5165\u53D8\u5316",paraId:8,tocIndex:10},{value:"handleBlur",paraId:8,tocIndex:10},{value:"(e: FocusEvent) => void",paraId:8,tocIndex:10},{value:"\u5904\u7406\u8F93\u5165\u5931\u7126",paraId:8,tocIndex:10},{value:"handleSubmit",paraId:8,tocIndex:10},{value:"(e?: FormEvent) => void",paraId:8,tocIndex:10},{value:"\u5904\u7406\u8868\u5355\u63D0\u4EA4",paraId:8,tocIndex:10},{value:"validateField",paraId:8,tocIndex:10},{value:"(name: keyof T) => Promise<string | undefined>",paraId:8,tocIndex:10},{value:"\u9A8C\u8BC1\u5355\u4E2A\u5B57\u6BB5",paraId:8,tocIndex:10},{value:"validateForm",paraId:8,tocIndex:10},{value:"() => Promise<Record<keyof T, string>>",paraId:8,tocIndex:10},{value:"\u9A8C\u8BC1\u6574\u4E2A\u8868\u5355",paraId:8,tocIndex:10},{value:"reset",paraId:8,tocIndex:10},{value:"() => void",paraId:8,tocIndex:10},{value:"\u91CD\u7F6E\u8868\u5355",paraId:8,tocIndex:10},{value:"getFieldProps",paraId:8,tocIndex:10},{value:"(name: keyof T) => FieldProps",paraId:8,tocIndex:10},{value:"\u83B7\u53D6\u5B57\u6BB5\u5C5E\u6027",paraId:8,tocIndex:10},{value:`// \u5B9A\u4E49\u8868\u5355\u6570\u636E\u7C7B\u578B
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
    // TypeScript \u4F1A\u63D0\u4F9B\u5B8C\u6574\u7684\u7C7B\u578B\u68C0\u67E5
    validate: (values) => {
      const errors: Partial<Record<keyof ContactForm, string>> = {};
      // \u9A8C\u8BC1\u903B\u8F91...
      return errors;
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* \u8868\u5355\u5185\u5BB9 */}
    </form>
  );
}
`,paraId:9,tocIndex:12},{value:`const form = useForm({
  initialValues: { email: '', password: '' },
  onSubmit: async (values) => {
    try {
      await loginUser(values);
      // \u6210\u529F\u5904\u7406
    } catch (error) {
      // \u8BBE\u7F6E\u670D\u52A1\u5668\u9519\u8BEF
      if (error.field) {
        form.setFieldError(error.field, error.message);
      } else {
        form.setErrors({ 
          email: '\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u90AE\u7BB1\u548C\u5BC6\u7801' 
        });
      }
    }
  }
});
`,paraId:10,tocIndex:13},{value:`function EditProfileForm({ user }) {
  const form = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || ''
    },
    onSubmit: async (values) => {
      await updateProfile(values);
      // \u53EF\u4EE5\u9009\u62E9\u662F\u5426\u91CD\u7F6E\u8868\u5355
      // form.reset();
    }
  });

  // \u5F53\u7528\u6237\u6570\u636E\u53D8\u5316\u65F6\u91CD\u65B0\u521D\u59CB\u5316\u8868\u5355
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
      {/* \u8868\u5355\u5185\u5BB9 */}
      <button type="button" onClick={form.reset}>
        \u91CD\u7F6E
      </button>
    </form>
  );
}
`,paraId:11,tocIndex:14},{value:"\u9A8C\u8BC1\u6A21\u5F0F",paraId:12,tocIndex:15},{value:"\uFF1A",paraId:12,tocIndex:15},{value:"onChange",paraId:13,tocIndex:15},{value:": \u6BCF\u6B21\u8F93\u5165\u90FD\u9A8C\u8BC1\uFF0C\u5B9E\u65F6\u53CD\u9988\u4F46\u53EF\u80FD\u5F71\u54CD\u6027\u80FD",paraId:13,tocIndex:15},{value:"onBlur",paraId:13,tocIndex:15},{value:": \u5931\u7126\u65F6\u9A8C\u8BC1\uFF0C\u5E73\u8861\u7528\u6237\u4F53\u9A8C\u548C\u6027\u80FD",paraId:13,tocIndex:15},{value:"onSubmit",paraId:13,tocIndex:15},{value:": \u63D0\u4EA4\u65F6\u9A8C\u8BC1\uFF0C\u6700\u5C11\u7684\u9A8C\u8BC1\u6B21\u6570",paraId:13,tocIndex:15},{value:"\u5F02\u6B65\u9A8C\u8BC1",paraId:14,tocIndex:15},{value:"\uFF1A\u5B57\u6BB5\u7EA7\u9A8C\u8BC1\u652F\u6301\u5F02\u6B65\u51FD\u6570\uFF0C\u4F46\u8981\u6CE8\u610F\u9632\u6296\u5904\u7406",paraId:14,tocIndex:15},{value:"\u6027\u80FD\u4F18\u5316",paraId:15,tocIndex:15},{value:"\uFF1A\u5927\u578B\u8868\u5355\u5EFA\u8BAE\u4F7F\u7528 ",paraId:15,tocIndex:15},{value:"onBlur",paraId:15,tocIndex:15},{value:" \u6216 ",paraId:15,tocIndex:15},{value:"onSubmit",paraId:15,tocIndex:15},{value:" \u9A8C\u8BC1\u6A21\u5F0F",paraId:15,tocIndex:15},{value:"\u9519\u8BEF\u805A\u7126",paraId:16,tocIndex:15},{value:"\uFF1A\u9ED8\u8BA4\u4F1A\u81EA\u52A8\u805A\u7126\u5230\u7B2C\u4E00\u4E2A\u9519\u8BEF\u5B57\u6BB5\uFF0C\u53EF\u901A\u8FC7 ",paraId:16,tocIndex:15},{value:"focusFirstError",paraId:16,tocIndex:15},{value:" \u63A7\u5236",paraId:16,tocIndex:15},{value:"\u8868\u5355\u91CD\u7F6E",paraId:17,tocIndex:15},{value:"\uFF1A",paraId:17,tocIndex:15},{value:"reset()",paraId:17,tocIndex:15},{value:" \u4F1A\u5C06\u8868\u5355\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001\uFF0C\u5305\u62EC\u6E05\u9664\u9519\u8BEF\u548C\u89E6\u6478\u72B6\u6001",paraId:17,tocIndex:15}]}}]);
