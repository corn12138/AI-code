"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[333],{55944:function(F,x,n){n.r(x),n.d(x,{demos:function(){return T}});var _=n(76711),S=n.n(_),P=n(73193),b=n.n(P),k=n(90819),d=n.n(k),D=n(89933),h=n.n(D),e=n(44194),y=n(68509),T={"src-use-form-demo-0":{component:e.memo(e.lazy(h()(d()().mark(function i(){var l,u,s;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return s=function(){var t=u({name:"",email:"",message:""}),m=t.values,o=t.errors,p=t.handleChange,f=t.handleSubmit;return e.createElement("form",{onSubmit:f(function(g){return console.log(g)})},e.createElement("input",{name:"name",value:m.name,onChange:p,placeholder:"Your Name"}),o.name&&e.createElement("span",null,o.name),e.createElement("input",{name:"email",type:"email",value:m.email,onChange:p,placeholder:"Your Email"}),o.email&&e.createElement("span",null,o.email),e.createElement("textarea",{name:"message",value:m.message,onChange:p,placeholder:"Your Message"}),o.message&&e.createElement("span",null,o.message),e.createElement("button",{type:"submit"},"Submit"))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:l=r.sent,u=l.useForm;case 5:case"end":return r.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-form-demo-0",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useForm } from '@corn12138/hooks';

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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":y},renderOpts:{compile:function(){var i=h()(d()().mark(function u(){var s,c=arguments;return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,n.e(216).then(n.bind(n,29525));case 2:return a.abrupt("return",(s=a.sent).default.apply(s,c));case 3:case"end":return a.stop()}},u)}));function l(){return i.apply(this,arguments)}return l}()}},"src-use-form-demo-1":{component:e.memo(e.lazy(h()(d()().mark(function i(){var l,u,s;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return s=function(){var t=u({email:"",password:""},{validate:{email:function(v){if(!v)return"Email is required";if(!/\S+@\S+\.\S+/.test(v))return"Email is invalid"},password:function(v){if(!v)return"Password is required";if(v.length<8)return"Password must be at least 8 characters"}}}),m=t.values,o=t.errors,p=t.handleChange,f=t.handleSubmit,g=t.isValid;return e.createElement("form",{onSubmit:f(handleLogin)},e.createElement("input",{name:"email",type:"email",value:m.email,onChange:p,placeholder:"Email"}),o.email&&e.createElement("span",null,o.email),e.createElement("input",{name:"password",type:"password",value:m.password,onChange:p,placeholder:"Password"}),o.password&&e.createElement("span",null,o.password),e.createElement("button",{type:"submit",disabled:!g},"Login"))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:l=r.sent,u=l.useForm;case 5:case"end":return r.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-form-demo-1",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useForm } from '@corn12138/hooks';

function ValidatedForm() {
  const { values, errors, handleChange, handleSubmit, isValid } = useForm({
    email: '',
    password: ''
  }, {
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/\\S+@\\S+\\.\\S+/.test(value)) return 'Email is invalid';
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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":y},renderOpts:{compile:function(){var i=h()(d()().mark(function u(){var s,c=arguments;return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,n.e(216).then(n.bind(n,29525));case 2:return a.abrupt("return",(s=a.sent).default.apply(s,c));case 3:case"end":return a.stop()}},u)}));function l(){return i.apply(this,arguments)}return l}()}},"src-use-form-demo-2":{component:e.memo(e.lazy(h()(d()().mark(function i(){var l,u,s;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return s=function(){var t=u({profile:{firstName:"",lastName:"",age:""},preferences:{theme:"light",notifications:!0}}),m=t.values,o=t.handleChange,p=t.handleSubmit,f=t.reset;return e.createElement("form",{onSubmit:p(handleSave)},e.createElement("h2",null,"Profile"),e.createElement("input",{name:"profile.firstName",value:m.profile.firstName,onChange:o,placeholder:"First Name"}),e.createElement("input",{name:"profile.lastName",value:m.profile.lastName,onChange:o,placeholder:"Last Name"}),e.createElement("input",{name:"profile.age",type:"number",value:m.profile.age,onChange:o,placeholder:"Age"}),e.createElement("h2",null,"Preferences"),e.createElement("select",{name:"preferences.theme",value:m.preferences.theme,onChange:o},e.createElement("option",{value:"light"},"Light"),e.createElement("option",{value:"dark"},"Dark")),e.createElement("label",null,e.createElement("input",{name:"preferences.notifications",type:"checkbox",checked:m.preferences.notifications,onChange:o}),"Enable notifications"),e.createElement("button",{type:"submit"},"Save"),e.createElement("button",{type:"button",onClick:f},"Reset"))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:l=r.sent,u=l.useForm;case 5:case"end":return r.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-form-demo-2",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useForm } from '@corn12138/hooks';

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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":y},renderOpts:{compile:function(){var i=h()(d()().mark(function u(){var s,c=arguments;return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,n.e(216).then(n.bind(n,29525));case 2:return a.abrupt("return",(s=a.sent).default.apply(s,c));case 3:case"end":return a.stop()}},u)}));function l(){return i.apply(this,arguments)}return l}()}},"src-use-form-demo-3":{component:e.memo(e.lazy(h()(d()().mark(function i(){var l,u,s;return d()().wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return s=function(){var t=u({items:[{name:"",quantity:1}]}),m=t.values,o=t.handleChange,p=t.handleSubmit,f=t.setValues,g=function(){f(function(I){return b()(b()({},I),{},{items:[].concat(S()(I.items),[{name:"",quantity:1}])})})},C=function(I){f(function(E){return b()(b()({},E),{},{items:E.items.filter(function(O,M){return M!==I})})})};return e.createElement("form",{onSubmit:p(handleSave)},m.items.map(function(v,I){return e.createElement("div",{key:I},e.createElement("input",{name:"items.".concat(I,".name"),value:v.name,onChange:o,placeholder:"Item name"}),e.createElement("input",{name:"items.".concat(I,".quantity"),type:"number",value:v.quantity,onChange:o,min:"1"}),e.createElement("button",{type:"button",onClick:function(){return C(I)}},"Remove"))}),e.createElement("button",{type:"button",onClick:g},"Add Item"),e.createElement("button",{type:"submit"},"Save"))},r.next=3,Promise.resolve().then(n.bind(n,68509));case 3:l=r.sent,u=l.useForm;case 5:case"end":return r.stop()}},i)})))),asset:{type:"BLOCK",id:"src-use-form-demo-3",refAtomIds:[],dependencies:{"index.tsx":{type:"FILE",value:`import { useForm } from '@corn12138/hooks';

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
            name={\`items.\${index}.name\`}
            value={item.name}
            onChange={handleChange}
            placeholder="Item name"
          />
          <input
            name={\`items.\${index}.quantity\`}
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
}`},"@corn12138/hooks":{type:"NPM",value:"1.0.5"}},entry:"index.tsx"},context:{"@corn12138/hooks":y},renderOpts:{compile:function(){var i=h()(d()().mark(function u(){var s,c=arguments;return d()().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,n.e(216).then(n.bind(n,29525));case 2:return a.abrupt("return",(s=a.sent).default.apply(s,c));case 3:case"end":return a.stop()}},u)}));function l(){return i.apply(this,arguments)}return l}()}}}},15882:function(F,x,n){n.r(x),n.d(x,{texts:function(){return _}});const _=[{value:"\u7528\u4E8E\u8868\u5355\u5904\u7406\u7684 React Hook\u3002",paraId:0,tocIndex:0},{value:`import { useForm } from '@corn12138/hooks';

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
`,paraId:1,tocIndex:5},{value:"\u53C2\u6570",paraId:2,tocIndex:7},{value:"\u7C7B\u578B",paraId:2,tocIndex:7},{value:"\u5FC5\u586B",paraId:2,tocIndex:7},{value:"\u63CF\u8FF0",paraId:2,tocIndex:7},{value:"options",paraId:2,tocIndex:7},{value:"UseFormOptions<T>",paraId:2,tocIndex:7},{value:"\u2705",paraId:2,tocIndex:7},{value:"\u8868\u5355\u914D\u7F6E\u9009\u9879",paraId:2,tocIndex:7},{value:"\u5C5E\u6027",paraId:3,tocIndex:8},{value:"\u7C7B\u578B",paraId:3,tocIndex:8},{value:"\u9ED8\u8BA4\u503C",paraId:3,tocIndex:8},{value:"\u63CF\u8FF0",paraId:3,tocIndex:8},{value:"initialValues",paraId:3,tocIndex:8},{value:"T",paraId:3,tocIndex:8},{value:"-",paraId:3,tocIndex:8},{value:"\u8868\u5355\u521D\u59CB\u503C",paraId:3,tocIndex:8},{value:"validate",paraId:3,tocIndex:8},{value:"(values: T) => Record<keyof T, string>",paraId:3,tocIndex:8},{value:"-",paraId:3,tocIndex:8},{value:"\u8868\u5355\u7EA7\u9A8C\u8BC1\u51FD\u6570",paraId:3,tocIndex:8},{value:"fieldValidators",paraId:3,tocIndex:8},{value:"Record<keyof T, Function>",paraId:3,tocIndex:8},{value:"-",paraId:3,tocIndex:8},{value:"\u5B57\u6BB5\u7EA7\u9A8C\u8BC1\u51FD\u6570\u6620\u5C04",paraId:3,tocIndex:8},{value:"onSubmit",paraId:3,tocIndex:8},{value:"(values: T) => void | Promise<void>",paraId:3,tocIndex:8},{value:"-",paraId:3,tocIndex:8},{value:"\u8868\u5355\u63D0\u4EA4\u5904\u7406\u51FD\u6570",paraId:3,tocIndex:8},{value:"validateMode",paraId:3,tocIndex:8},{value:"'onChange' | 'onBlur' | 'onSubmit'",paraId:3,tocIndex:8},{value:"'onSubmit'",paraId:3,tocIndex:8},{value:"\u9A8C\u8BC1\u89E6\u53D1\u6A21\u5F0F",paraId:3,tocIndex:8},{value:"reValidateMode",paraId:3,tocIndex:8},{value:"'onChange' | 'onBlur' | 'onSubmit'",paraId:3,tocIndex:8},{value:"'onChange'",paraId:3,tocIndex:8},{value:"\u91CD\u65B0\u9A8C\u8BC1\u6A21\u5F0F",paraId:3,tocIndex:8},{value:"focusFirstError",paraId:3,tocIndex:8},{value:"boolean",paraId:3,tocIndex:8},{value:"true",paraId:3,tocIndex:8},{value:"\u662F\u5426\u81EA\u52A8\u805A\u7126\u7B2C\u4E00\u4E2A\u9519\u8BEF\u5B57\u6BB5",paraId:3,tocIndex:8},{value:"\u5C5E\u6027",paraId:4,tocIndex:9},{value:"\u7C7B\u578B",paraId:4,tocIndex:9},{value:"\u63CF\u8FF0",paraId:4,tocIndex:9},{value:"values",paraId:4,tocIndex:9},{value:"T",paraId:4,tocIndex:9},{value:"\u8868\u5355\u5F53\u524D\u503C",paraId:4,tocIndex:9},{value:"errors",paraId:4,tocIndex:9},{value:"Partial<Record<keyof T, string>>",paraId:4,tocIndex:9},{value:"\u8868\u5355\u9A8C\u8BC1\u9519\u8BEF",paraId:4,tocIndex:9},{value:"touched",paraId:4,tocIndex:9},{value:"Partial<Record<keyof T, boolean>>",paraId:4,tocIndex:9},{value:"\u5B57\u6BB5\u89E6\u6478\u72B6\u6001",paraId:4,tocIndex:9},{value:"isSubmitting",paraId:4,tocIndex:9},{value:"boolean",paraId:4,tocIndex:9},{value:"\u662F\u5426\u6B63\u5728\u63D0\u4EA4",paraId:4,tocIndex:9},{value:"isValid",paraId:4,tocIndex:9},{value:"boolean",paraId:4,tocIndex:9},{value:"\u8868\u5355\u662F\u5426\u6709\u6548",paraId:4,tocIndex:9},{value:"isDirty",paraId:4,tocIndex:9},{value:"boolean",paraId:4,tocIndex:9},{value:"\u8868\u5355\u662F\u5426\u5DF2\u4FEE\u6539",paraId:4,tocIndex:9},{value:"isValidated",paraId:4,tocIndex:9},{value:"boolean",paraId:4,tocIndex:9},{value:"\u662F\u5426\u5DF2\u9A8C\u8BC1\u8FC7",paraId:4,tocIndex:9},{value:"\u65B9\u6CD5",paraId:5,tocIndex:10},{value:"\u7C7B\u578B",paraId:5,tocIndex:10},{value:"\u63CF\u8FF0",paraId:5,tocIndex:10},{value:"setFieldValue",paraId:5,tocIndex:10},{value:"(name: keyof T, value: any) => void",paraId:5,tocIndex:10},{value:"\u8BBE\u7F6E\u5355\u4E2A\u5B57\u6BB5\u503C",paraId:5,tocIndex:10},{value:"setValues",paraId:5,tocIndex:10},{value:"(values: Partial<T>) => void",paraId:5,tocIndex:10},{value:"\u6279\u91CF\u8BBE\u7F6E\u5B57\u6BB5\u503C",paraId:5,tocIndex:10},{value:"setFieldError",paraId:5,tocIndex:10},{value:"(name: keyof T, error: string) => void",paraId:5,tocIndex:10},{value:"\u8BBE\u7F6E\u5B57\u6BB5\u9519\u8BEF",paraId:5,tocIndex:10},{value:"setErrors",paraId:5,tocIndex:10},{value:"(errors: Record<keyof T, string>) => void",paraId:5,tocIndex:10},{value:"\u6279\u91CF\u8BBE\u7F6E\u9519\u8BEF",paraId:5,tocIndex:10},{value:"clearErrors",paraId:5,tocIndex:10},{value:"() => void",paraId:5,tocIndex:10},{value:"\u6E05\u9664\u6240\u6709\u9519\u8BEF",paraId:5,tocIndex:10},{value:"setFieldTouched",paraId:5,tocIndex:10},{value:"(name: keyof T, touched?: boolean) => void",paraId:5,tocIndex:10},{value:"\u8BBE\u7F6E\u5B57\u6BB5\u89E6\u6478\u72B6\u6001",paraId:5,tocIndex:10},{value:"handleChange",paraId:5,tocIndex:10},{value:"(e: ChangeEvent) => void",paraId:5,tocIndex:10},{value:"\u5904\u7406\u8F93\u5165\u53D8\u5316",paraId:5,tocIndex:10},{value:"handleBlur",paraId:5,tocIndex:10},{value:"(e: FocusEvent) => void",paraId:5,tocIndex:10},{value:"\u5904\u7406\u8F93\u5165\u5931\u7126",paraId:5,tocIndex:10},{value:"handleSubmit",paraId:5,tocIndex:10},{value:"(e?: FormEvent) => void",paraId:5,tocIndex:10},{value:"\u5904\u7406\u8868\u5355\u63D0\u4EA4",paraId:5,tocIndex:10},{value:"validateField",paraId:5,tocIndex:10},{value:"(name: keyof T) => Promise<string | undefined>",paraId:5,tocIndex:10},{value:"\u9A8C\u8BC1\u5355\u4E2A\u5B57\u6BB5",paraId:5,tocIndex:10},{value:"validateForm",paraId:5,tocIndex:10},{value:"() => Promise<Record<keyof T, string>>",paraId:5,tocIndex:10},{value:"\u9A8C\u8BC1\u6574\u4E2A\u8868\u5355",paraId:5,tocIndex:10},{value:"reset",paraId:5,tocIndex:10},{value:"() => void",paraId:5,tocIndex:10},{value:"\u91CD\u7F6E\u8868\u5355",paraId:5,tocIndex:10},{value:"getFieldProps",paraId:5,tocIndex:10},{value:"(name: keyof T) => FieldProps",paraId:5,tocIndex:10},{value:"\u83B7\u53D6\u5B57\u6BB5\u5C5E\u6027",paraId:5,tocIndex:10},{value:`// \u5B9A\u4E49\u8868\u5355\u6570\u636E\u7C7B\u578B
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
`,paraId:6,tocIndex:12},{value:`const form = useForm({
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
`,paraId:7,tocIndex:13},{value:`function EditProfileForm({ user }) {
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
`,paraId:8,tocIndex:14},{value:"\u9A8C\u8BC1\u6A21\u5F0F",paraId:9,tocIndex:15},{value:"\uFF1A",paraId:9,tocIndex:15},{value:"onChange",paraId:10,tocIndex:15},{value:": \u6BCF\u6B21\u8F93\u5165\u90FD\u9A8C\u8BC1\uFF0C\u5B9E\u65F6\u53CD\u9988\u4F46\u53EF\u80FD\u5F71\u54CD\u6027\u80FD",paraId:10,tocIndex:15},{value:"onBlur",paraId:10,tocIndex:15},{value:": \u5931\u7126\u65F6\u9A8C\u8BC1\uFF0C\u5E73\u8861\u7528\u6237\u4F53\u9A8C\u548C\u6027\u80FD",paraId:10,tocIndex:15},{value:"onSubmit",paraId:10,tocIndex:15},{value:": \u63D0\u4EA4\u65F6\u9A8C\u8BC1\uFF0C\u6700\u5C11\u7684\u9A8C\u8BC1\u6B21\u6570",paraId:10,tocIndex:15},{value:"\u5F02\u6B65\u9A8C\u8BC1",paraId:11,tocIndex:15},{value:"\uFF1A\u5B57\u6BB5\u7EA7\u9A8C\u8BC1\u652F\u6301\u5F02\u6B65\u51FD\u6570\uFF0C\u4F46\u8981\u6CE8\u610F\u9632\u6296\u5904\u7406",paraId:11,tocIndex:15},{value:"\u6027\u80FD\u4F18\u5316",paraId:12,tocIndex:15},{value:"\uFF1A\u5927\u578B\u8868\u5355\u5EFA\u8BAE\u4F7F\u7528 ",paraId:12,tocIndex:15},{value:"onBlur",paraId:12,tocIndex:15},{value:" \u6216 ",paraId:12,tocIndex:15},{value:"onSubmit",paraId:12,tocIndex:15},{value:" \u9A8C\u8BC1\u6A21\u5F0F",paraId:12,tocIndex:15},{value:"\u9519\u8BEF\u805A\u7126",paraId:13,tocIndex:15},{value:"\uFF1A\u9ED8\u8BA4\u4F1A\u81EA\u52A8\u805A\u7126\u5230\u7B2C\u4E00\u4E2A\u9519\u8BEF\u5B57\u6BB5\uFF0C\u53EF\u901A\u8FC7 ",paraId:13,tocIndex:15},{value:"focusFirstError",paraId:13,tocIndex:15},{value:" \u63A7\u5236",paraId:13,tocIndex:15},{value:"\u8868\u5355\u91CD\u7F6E",paraId:14,tocIndex:15},{value:"\uFF1A",paraId:14,tocIndex:15},{value:"reset()",paraId:14,tocIndex:15},{value:" \u4F1A\u5C06\u8868\u5355\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001\uFF0C\u5305\u62EC\u6E05\u9664\u9519\u8BEF\u548C\u89E6\u6478\u72B6\u6001",paraId:14,tocIndex:15}]}}]);
