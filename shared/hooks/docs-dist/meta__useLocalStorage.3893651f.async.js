"use strict";(self.webpackChunk_corn12138_hooks=self.webpackChunk_corn12138_hooks||[]).push([[12],{33490:function(a,e,n){n.r(e),n.d(e,{demos:function(){return o}});var t=n(44194),o={}},77568:function(a,e,n){n.r(e),n.d(e,{texts:function(){return t}});const t=[{value:"\u672C\u5730\u5B58\u50A8\u7BA1\u7406 Hook\uFF0C\u63D0\u4F9B\u7C7B\u578B\u5B89\u5168\u7684 localStorage \u64CD\u4F5C\uFF0C\u652F\u6301\u8DE8\u6807\u7B7E\u9875\u540C\u6B65\u548C\u81EA\u5B9A\u4E49\u5E8F\u5217\u5316\u3002",paraId:0,tocIndex:0},{value:`import { useLocalStorage } from '@ai-code/hooks';

function UserPreferences() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 14);
  const [userSettings, setUserSettings] = useLocalStorage('userSettings', {
    notifications: true,
    autoSave: false
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const increaseFontSize = () => {
    setFontSize(prev => prev + 2);
  };

  const toggleNotifications = () => {
    setUserSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  return (
    <div>
      <h2>\u7528\u6237\u504F\u597D\u8BBE\u7F6E</h2>
      
      <div>
        <p>\u5F53\u524D\u4E3B\u9898: {theme}</p>
        <button onClick={toggleTheme}>\u5207\u6362\u4E3B\u9898</button>
        <button onClick={removeTheme}>\u91CD\u7F6E\u4E3B\u9898</button>
      </div>
      
      <div>
        <p>\u5B57\u4F53\u5927\u5C0F: {fontSize}px</p>
        <button onClick={increaseFontSize}>\u589E\u5927\u5B57\u4F53</button>
        <button onClick={() => setFontSize(14)}>\u91CD\u7F6E\u5B57\u4F53</button>
      </div>
      
      <div>
        <p>\u901A\u77E5: {userSettings.notifications ? '\u5F00\u542F' : '\u5173\u95ED'}</p>
        <button onClick={toggleNotifications}>\u5207\u6362\u901A\u77E5</button>
      </div>
    </div>
  );
}
`,paraId:1,tocIndex:1},{value:`import { useLocalStorage } from '@ai-code/hooks';

function CrossTabSync() {
  // \u8DE8\u6807\u7B7E\u9875\u540C\u6B65\u7528\u6237\u72B6\u6001
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false, {
    syncAcrossTabs: true  // \u9ED8\u8BA4\u4E3A true
  });

  const [shoppingCart, setShoppingCart] = useLocalStorage('cart', [], {
    syncAcrossTabs: true
  });

  const login = () => {
    setIsLoggedIn(true);
    // \u5176\u4ED6\u6807\u7B7E\u9875\u4F1A\u540C\u6B65\u66F4\u65B0
  };

  const logout = () => {
    setIsLoggedIn(false);
    setShoppingCart([]); // \u6E05\u7A7A\u8D2D\u7269\u8F66
  };

  const addToCart = (item) => {
    setShoppingCart(prev => [...prev, item]);
  };

  return (
    <div>
      <h2>\u8D2D\u7269\u5E94\u7528</h2>
      
      {isLoggedIn ? (
        <div>
          <p>\u5DF2\u767B\u5F55 (\u6240\u6709\u6807\u7B7E\u9875\u540C\u6B65)</p>
          <p>\u8D2D\u7269\u8F66\u5546\u54C1\u6570: {shoppingCart.length}</p>
          
          <button onClick={() => addToCart({ id: Date.now(), name: '\u5546\u54C1' })}>
            \u6DFB\u52A0\u5546\u54C1
          </button>
          
          <button onClick={logout}>\u767B\u51FA</button>
        </div>
      ) : (
        <div>
          <p>\u672A\u767B\u5F55</p>
          <button onClick={login}>\u767B\u5F55</button>
        </div>
      )}
    </div>
  );
}
`,paraId:2,tocIndex:3},{value:`import { useLocalStorage } from '@ai-code/hooks';

// \u81EA\u5B9A\u4E49\u65E5\u671F\u5E8F\u5217\u5316
function DateStorage() {
  const [lastVisit, setLastVisit] = useLocalStorage(
    'lastVisit',
    new Date(),
    {
      serializer: {
        read: (value) => new Date(value),
        write: (value) => value.toISOString()
      }
    }
  );

  const updateVisit = () => {
    setLastVisit(new Date());
  };

  return (
    <div>
      <h2>\u8BBF\u95EE\u8BB0\u5F55</h2>
      <p>\u4E0A\u6B21\u8BBF\u95EE: {lastVisit.toLocaleString()}</p>
      <button onClick={updateVisit}>\u66F4\u65B0\u8BBF\u95EE\u65F6\u95F4</button>
    </div>
  );
}

// \u538B\u7F29\u5B58\u50A8\u5927\u5BF9\u8C61
function CompressedStorage() {
  const [largeData, setLargeData] = useLocalStorage(
    'compressedData',
    { items: [] },
    {
      serializer: {
        read: (value) => {
          // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u89E3\u538B\u7F29\u903B\u8F91
          return JSON.parse(value);
        },
        write: (value) => {
          // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u538B\u7F29\u903B\u8F91
          return JSON.stringify(value);
        }
      },
      onError: (error) => {
        console.error('\u5B58\u50A8\u9519\u8BEF:', error);
        // \u53EF\u4EE5\u5728\u8FD9\u91CC\u6DFB\u52A0\u9519\u8BEF\u4E0A\u62A5
      }
    }
  );

  const addItem = () => {
    setLargeData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), data: Math.random() }]
    }));
  };

  return (
    <div>
      <h2>\u5927\u6570\u636E\u5B58\u50A8</h2>
      <p>\u6570\u636E\u9879\u6570\u91CF: {largeData.items.length}</p>
      <button onClick={addItem}>\u6DFB\u52A0\u6570\u636E</button>
    </div>
  );
}
`,paraId:3,tocIndex:4},{value:`import { useLocalStorage } from '@ai-code/hooks';

function ErrorHandling() {
  const [sensitiveData, setSensitiveData] = useLocalStorage(
    'sensitiveData',
    { token: '', preferences: {} },
    {
      onError: (error) => {
        console.error('localStorage \u9519\u8BEF:', error);
        
        // \u6839\u636E\u9519\u8BEF\u7C7B\u578B\u5904\u7406
        if (error.name === 'QuotaExceededError') {
          alert('\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u6E05\u7406\u6D4F\u89C8\u5668\u6570\u636E');
        } else if (error.name === 'SecurityError') {
          console.warn('\u65E0\u6CD5\u8BBF\u95EE localStorage\uFF0C\u53EF\u80FD\u5904\u4E8E\u9690\u79C1\u6A21\u5F0F');
        } else {
          console.warn('\u5B58\u50A8\u64CD\u4F5C\u5931\u8D25:', error.message);
        }
      }
    }
  );

  const saveToken = (token) => {
    try {
      setSensitiveData(prev => ({ ...prev, token }));
    } catch (error) {
      // \u9519\u8BEF\u4F1A\u901A\u8FC7 onError \u56DE\u8C03\u5904\u7406
    }
  };

  return (
    <div>
      <h2>\u654F\u611F\u6570\u636E\u5B58\u50A8</h2>
      <p>Token: {sensitiveData.token ? '\u5DF2\u8BBE\u7F6E' : '\u672A\u8BBE\u7F6E'}</p>
      <button onClick={() => saveToken('new-token-' + Date.now())}>
        \u4FDD\u5B58\u65B0Token
      </button>
    </div>
  );
}
`,paraId:4,tocIndex:5},{value:`import { useLocalStorage } from '@ai-code/hooks';
import { useState, useEffect } from 'react';

function PersistentForm() {
  // \u6301\u4E45\u5316\u8868\u5355\u6570\u636E
  const [formData, setFormData] = useLocalStorage('formDraft', {
    name: '',
    email: '',
    message: ''
  });

  const [isSaved, setIsSaved] = useState(true);

  // \u76D1\u542C\u8868\u5355\u53D8\u5316
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => setIsSaved(true), 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearDraft = () => {
    setFormData({ name: '', email: '', message: '' });
  };

  const submitForm = async () => {
    try {
      // \u63D0\u4EA4\u8868\u5355
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // \u6210\u529F\u540E\u6E05\u9664\u8349\u7A3F
      clearDraft();
      alert('\u63D0\u4EA4\u6210\u529F\uFF01');
    } catch (error) {
      alert('\u63D0\u4EA4\u5931\u8D25\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u5B58');
    }
  };

  return (
    <div>
      <h2>\u6301\u4E45\u5316\u8868\u5355</h2>
      <p>\u72B6\u6001: {isSaved ? '\u5DF2\u4FDD\u5B58' : '\u4FDD\u5B58\u4E2D...'}</p>
      
      <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
        <div>
          <input
            type="text"
            placeholder="\u59D3\u540D"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        
        <div>
          <input
            type="email"
            placeholder="\u90AE\u7BB1"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        
        <div>
          <textarea
            placeholder="\u6D88\u606F"
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
          />
        </div>
        
        <div>
          <button type="submit">\u63D0\u4EA4</button>
          <button type="button" onClick={clearDraft}>\u6E05\u9664\u8349\u7A3F</button>
        </div>
      </form>
    </div>
  );
}
`,paraId:5,tocIndex:6},{value:"\u53C2\u6570",paraId:6,tocIndex:8},{value:"\u7C7B\u578B",paraId:6,tocIndex:8},{value:"\u5FC5\u586B",paraId:6,tocIndex:8},{value:"\u63CF\u8FF0",paraId:6,tocIndex:8},{value:"key",paraId:6,tocIndex:8},{value:"string",paraId:6,tocIndex:8},{value:"\u2705",paraId:6,tocIndex:8},{value:"localStorage \u952E\u540D",paraId:6,tocIndex:8},{value:"initialValue",paraId:6,tocIndex:8},{value:"T",paraId:6,tocIndex:8},{value:"\u2705",paraId:6,tocIndex:8},{value:"\u521D\u59CB\u503C",paraId:6,tocIndex:8},{value:"options",paraId:6,tocIndex:8},{value:"UseLocalStorageOptions<T>",paraId:6,tocIndex:8},{value:"\u274C",paraId:6,tocIndex:8},{value:"\u914D\u7F6E\u9009\u9879",paraId:6,tocIndex:8},{value:"\u5C5E\u6027",paraId:7,tocIndex:9},{value:"\u7C7B\u578B",paraId:7,tocIndex:9},{value:"\u9ED8\u8BA4\u503C",paraId:7,tocIndex:9},{value:"\u63CF\u8FF0",paraId:7,tocIndex:9},{value:"serializer",paraId:7,tocIndex:9},{value:"{ read: Function, write: Function }",paraId:7,tocIndex:9},{value:"JSON",paraId:7,tocIndex:9},{value:"\u5E8F\u5217\u5316\u914D\u7F6E",paraId:7,tocIndex:9},{value:"syncAcrossTabs",paraId:7,tocIndex:9},{value:"boolean",paraId:7,tocIndex:9},{value:"true",paraId:7,tocIndex:9},{value:"\u662F\u5426\u8DE8\u6807\u7B7E\u9875\u540C\u6B65",paraId:7,tocIndex:9},{value:"onError",paraId:7,tocIndex:9},{value:"(error: Error) => void",paraId:7,tocIndex:9},{value:"console.error",paraId:7,tocIndex:9},{value:"\u9519\u8BEF\u5904\u7406\u56DE\u8C03",paraId:7,tocIndex:9},{value:"\u8FD4\u56DE\u4E00\u4E2A\u6570\u7EC4 ",paraId:8,tocIndex:10},{value:"[value, setValue, removeValue]",paraId:8,tocIndex:10},{value:"\uFF1A",paraId:8,tocIndex:10},{value:"\u7D22\u5F15",paraId:9,tocIndex:10},{value:"\u7C7B\u578B",paraId:9,tocIndex:10},{value:"\u63CF\u8FF0",paraId:9,tocIndex:10},{value:"0",paraId:9,tocIndex:10},{value:"T",paraId:9,tocIndex:10},{value:"\u5F53\u524D\u5B58\u50A8\u7684\u503C",paraId:9,tocIndex:10},{value:"1",paraId:9,tocIndex:10},{value:"(value: T | (prev: T) => T) => void",paraId:9,tocIndex:10},{value:"\u8BBE\u7F6E\u503C\u7684\u51FD\u6570",paraId:9,tocIndex:10},{value:"2",paraId:9,tocIndex:10},{value:"() => void",paraId:9,tocIndex:10},{value:"\u5220\u9664\u503C\u7684\u51FD\u6570",paraId:9,tocIndex:10},{value:`function UserSettings() {
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">\u4E2D\u6587</option>
        <option value="en-US">English</option>
      </select>
      
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        \u5207\u6362\u4E3B\u9898
      </button>
      
      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
        {sidebarCollapsed ? '\u5C55\u5F00' : '\u6536\u8D77'}\u4FA7\u8FB9\u680F
      </button>
    </div>
  );
}
`,paraId:10,tocIndex:12},{value:`function ShoppingCart() {
  const [items, setItems] = useLocalStorage('cartItems', []);

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div>
      <h2>\u8D2D\u7269\u8F66 ({items.length} \u4EF6\u5546\u54C1)</h2>
      <p>\u603B\u4EF7: \xA5{getTotalPrice()}</p>
      
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>\u5220\u9664</button>
        </div>
      ))}
    </div>
  );
}
`,paraId:11,tocIndex:13},{value:`function GameSave() {
  const [gameState, setGameState] = useLocalStorage('gameState', {
    level: 1,
    score: 0,
    lives: 3,
    achievements: []
  });

  const saveGame = (newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const resetGame = () => {
    setGameState({
      level: 1,
      score: 0,
      lives: 3,
      achievements: []
    });
  };

  return (
    <div>
      <h2>\u6E38\u620F\u5B58\u6863</h2>
      <p>\u7B49\u7EA7: {gameState.level}</p>
      <p>\u5206\u6570: {gameState.score}</p>
      <p>\u751F\u547D: {gameState.lives}</p>
      <p>\u6210\u5C31: {gameState.achievements.length}</p>
      
      <button onClick={() => saveGame({ score: gameState.score + 100 })}>
        \u589E\u52A0\u5206\u6570
      </button>
      
      <button onClick={resetGame}>\u91CD\u7F6E\u6E38\u620F</button>
    </div>
  );
}
`,paraId:12,tocIndex:14},{value:`const [userProfile, setUserProfile] = useLocalStorage(
  'userProfile',
  { name: '', age: 0 },
  {
    serializer: {
      read: (value) => {
        try {
          const data = JSON.parse(value);
          // \u9A8C\u8BC1\u6570\u636E\u7ED3\u6784
          if (typeof data.name === 'string' && typeof data.age === 'number') {
            return data;
          }
          throw new Error('Invalid data structure');
        } catch {
          return { name: '', age: 0 }; // \u8FD4\u56DE\u9ED8\u8BA4\u503C
        }
      },
      write: JSON.stringify
    }
  }
);
`,paraId:13,tocIndex:16},{value:`const STORAGE_VERSION = '1.0';

const [appData, setAppData] = useLocalStorage(
  'appData',
  { version: STORAGE_VERSION, data: {} },
  {
    serializer: {
      read: (value) => {
        const stored = JSON.parse(value);
        if (stored.version !== STORAGE_VERSION) {
          // \u5904\u7406\u7248\u672C\u5347\u7EA7
          return { version: STORAGE_VERSION, data: {} };
        }
        return stored;
      },
      write: JSON.stringify
    }
  }
);
`,paraId:14,tocIndex:17},{value:`// \u5BF9\u4E8E\u5927\u5BF9\u8C61\uFF0C\u4F7F\u7528\u9632\u6296\u4F18\u5316\u5199\u5165
import { useDebouncedCallback } from '@ai-code/hooks';

function OptimizedStorage() {
  const [data, setData] = useLocalStorage('largeData', {});
  
  const debouncedSetData = useDebouncedCallback(setData, 500);
  
  // \u9891\u7E41\u66F4\u65B0\u65F6\u4F7F\u7528\u9632\u6296\u7248\u672C
  const handleDataChange = (newData) => {
    debouncedSetData(newData);
  };

  return <div>/* \u7EC4\u4EF6\u5185\u5BB9 */</div>;
}
`,paraId:15,tocIndex:18},{value:"\u5B58\u50A8\u9650\u5236",paraId:16,tocIndex:19},{value:"\uFF1AlocalStorage \u901A\u5E38\u6709 5-10MB \u7684\u5B58\u50A8\u9650\u5236",paraId:16,tocIndex:19},{value:"\u540C\u6B65\u64CD\u4F5C",paraId:16,tocIndex:19},{value:"\uFF1AlocalStorage \u662F\u540C\u6B65 API\uFF0C\u5927\u91CF\u6570\u636E\u53EF\u80FD\u5F71\u54CD\u6027\u80FD",paraId:16,tocIndex:19},{value:"\u9690\u79C1\u6A21\u5F0F",paraId:16,tocIndex:19},{value:"\uFF1A\u67D0\u4E9B\u6D4F\u89C8\u5668\u7684\u9690\u79C1\u6A21\u5F0F\u53EF\u80FD\u7981\u7528 localStorage",paraId:16,tocIndex:19},{value:"\u6570\u636E\u7C7B\u578B",paraId:16,tocIndex:19},{value:"\uFF1A\u53EA\u80FD\u5B58\u50A8\u5B57\u7B26\u4E32\uFF0C\u590D\u6742\u5BF9\u8C61\u9700\u8981\u5E8F\u5217\u5316",paraId:16,tocIndex:19},{value:"\u8DE8\u57DF\u9650\u5236",paraId:16,tocIndex:19},{value:"\uFF1A\u4E0D\u540C\u57DF\u540D\u65E0\u6CD5\u5171\u4EAB localStorage \u6570\u636E",paraId:16,tocIndex:19},{value:"\u751F\u547D\u5468\u671F",paraId:16,tocIndex:19},{value:"\uFF1A\u6570\u636E\u4F1A\u6C38\u4E45\u4FDD\u5B58\uFF0C\u76F4\u5230\u7528\u6237\u624B\u52A8\u6E05\u9664\u6216\u4EE3\u7801\u5220\u9664",paraId:16,tocIndex:19}]}}]);
