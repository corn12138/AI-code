import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { useArticleStore } from './store/articleStore';
import './styles/native-optimization.css';
import { nativeBridge } from './utils/native-bridge';

// 获取服务端传递的初始数据
const initialData = (window as any).__INITIAL_DATA__;
const ssrContext = (window as any).__SSR_CONTEXT__;

// 如果有初始数据，使用它来初始化store
if (initialData) {
  const store = useArticleStore.getState();

  // 合并服务端数据到客户端store
  if (initialData.articles) {
    useArticleStore.setState({
      articles: initialData.articles,
      currentCategory: initialData.currentCategory || 'latest',
      pagination: initialData.pagination || store.pagination,
      loading: false,
      error: null,
    });
  }

  if (initialData.currentArticle) {
    useArticleStore.setState({
      currentArticle: initialData.currentArticle,
      loading: false,
      error: null,
    });
  }
}

const container = document.getElementById('root')!;

// 判断是否为SSR环境（服务端渲染后的水合）
const isSSR = container.innerHTML.trim() !== '';

if (isSSR) {
  // SSR环境：使用hydrateRoot进行水合
  hydrateRoot(
    container,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // 客户端渲染：使用createRoot
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// 清理全局变量
delete (window as any).__INITIAL_DATA__;
delete (window as any).__SSR_CONTEXT__;

// 原生环境初始化
if (nativeBridge.isInNative()) {
  console.log('Running in native environment');

  // 设置原生环境标识
  document.body.classList.add('native-environment');

  // 初始化原生桥接
  nativeBridge.getDeviceInfo().then(deviceInfo => {
    console.log('Device info:', deviceInfo);
  });

  nativeBridge.getNetworkStatus().then(networkStatus => {
    console.log('Network status:', networkStatus);
  });
} else {
  console.log('Running in web environment');
  document.body.classList.add('web-environment');
}

// 开发环境下的热更新支持
if (import.meta.hot) {
  import.meta.hot.accept();
}