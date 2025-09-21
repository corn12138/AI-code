import { describe, expect, it, beforeEach } from 'vitest';

import type { ComponentModel, PageModel } from '@/types';
import { useEditorStore } from '../editorStore';

const storageMock = (() => {
  let store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
})();

const createRootPage = (): PageModel => ({
  id: 'page-1',
  name: '测试页面',
  description: '用于测试的页面',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  components: {
    id: 'root',
    type: 'container',
    name: 'RootContainer',
    props: {},
    style: {},
    children: []
  }
});

const createComponent = (id: string, overrides: Partial<ComponentModel> = {}): ComponentModel => ({
  id,
  type: 'text',
  name: `Text-${id}`,
  props: { text: 'Hello' },
  style: { color: '#fff' },
  children: [],
  ...overrides
});

describe('useEditorStore', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      configurable: true
    });
  });

  beforeEach(() => {
    useEditorStore.setState({
      currentPage: null,
      selectedId: null,
      hoveredId: null,
      mode: 'edit',
      canvasScale: 1,
      showGrid: true
    });
  });

  it('initialises page and adds component to root', () => {
    const state = useEditorStore.getState();
    const page = createRootPage();

    state.initPage(page);
    state.addComponent(createComponent('comp-1'));

    const updated = useEditorStore.getState().currentPage;
    expect(updated?.components.children).toHaveLength(1);
    expect(updated?.components.children?.[0].id).toBe('comp-1');
    expect(useEditorStore.getState().selectedId).toBe('comp-1');
  });

  it('updates component props and style', () => {
    const state = useEditorStore.getState();
    state.initPage(createRootPage());
    const component = createComponent('comp-2');
    state.addComponent(component);

    state.updateComponentProps('comp-2', { text: 'Updated' });
    state.updateComponentStyle('comp-2', { fontSize: 18 });

    const target = useEditorStore.getState().getSelectedComponent();
    expect(target?.props).toMatchObject({ text: 'Updated' });
    expect(target?.style).toMatchObject({ color: '#fff', fontSize: 18 });
  });

  it('duplicates and deletes component', () => {
    const state = useEditorStore.getState();
    state.initPage(createRootPage());
    state.addComponent(createComponent('comp-3'));

    state.duplicateComponent('comp-3');
    const children = useEditorStore.getState().currentPage?.components.children ?? [];
    expect(children).toHaveLength(2);
    const duplicate = children.find((c) => c.id !== 'comp-3');
    expect(duplicate).toBeDefined();

    state.deleteComponent('comp-3');
    const remaining = useEditorStore.getState().currentPage?.components.children ?? [];
    expect(remaining).toHaveLength(1);
  });
});
