import { ComponentModel, EditorMode, EditorState, PageModel } from '@/types';
import { findComponentById, removeComponent } from '@/utils/components';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EditorStore extends EditorState {
  // 页面操作
  initPage: (page: PageModel) => void;
  setPageName: (name: string) => void;
  setPageDescription: (description: string) => void;

  // 组件操作
  addComponent: (component: ComponentModel, parentId?: string, index?: number) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateComponentStyle: (id: string, style: Record<string, any>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (id: string, newParentId: string, index?: number) => void;

  // 选择操作
  selectComponent: (id: string | null) => void;
  hoverComponent: (id: string | null) => void;
  getSelectedComponent: () => ComponentModel | null;

  // 编辑器设置
  setMode: (mode: EditorMode) => void;
  setCanvasScale: (scale: number) => void;
  toggleGrid: () => void;

  // 导出和导入
  getPageJSON: () => PageModel;
  importPageJSON: (json: PageModel) => void;
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentPage: null,
        selectedId: null,
        hoveredId: null,
        mode: 'edit',
        canvasScale: 1,
        showGrid: true,

        // 页面操作
        initPage: (page) => set({ currentPage: page }),

        setPageName: (name) => set((state) => ({
          currentPage: state.currentPage ? { ...state.currentPage, name } : null
        })),

        setPageDescription: (description) => set((state) => ({
          currentPage: state.currentPage ? { ...state.currentPage, description } : null
        })),

        // 组件操作
        addComponent: (component, parentId, index) => set((state) => {
          if (!state.currentPage) return state;

          // 如果没有父组件ID，则添加到根组件的children中
          if (!parentId) {
            const rootChildren = state.currentPage.components.children || [];
            return {
              currentPage: {
                ...state.currentPage,
                components: {
                  ...state.currentPage.components,
                  children: index !== undefined
                    ? [...rootChildren.slice(0, index), component, ...rootChildren.slice(index)]
                    : [...rootChildren, component]
                }
              },
              selectedId: component.id
            };
          }

          // 否则找到对应的父组件，将新组件添加到其children中
          const updatedComponents = JSON.parse(JSON.stringify(state.currentPage.components));
          const parentComponent = findComponentById(updatedComponents, parentId);

          if (parentComponent) {
            parentComponent.children = parentComponent.children || [];
            if (index !== undefined) {
              parentComponent.children.splice(index, 0, component);
            } else {
              parentComponent.children.push(component);
            }
          }

          return {
            currentPage: {
              ...state.currentPage,
              components: updatedComponents
            },
            selectedId: component.id
          };
        }),

        updateComponentProps: (id, props) => set((state) => {
          if (!state.currentPage) return state;

          const updatedComponents = JSON.parse(JSON.stringify(state.currentPage.components));
          const component = findComponentById(updatedComponents, id);

          if (component) {
            component.props = { ...component.props, ...props };
          }

          return {
            currentPage: {
              ...state.currentPage,
              components: updatedComponents
            }
          };
        }),

        updateComponentStyle: (id, style) => set((state) => {
          if (!state.currentPage) return state;

          const updatedComponents = JSON.parse(JSON.stringify(state.currentPage.components));
          const component = findComponentById(updatedComponents, id);

          if (component) {
            component.style = { ...component.style, ...style };
          }

          return {
            currentPage: {
              ...state.currentPage,
              components: updatedComponents
            }
          };
        }),

        deleteComponent: (id) => set((state) => {
          if (!state.currentPage) return state;

          const updatedComponents = JSON.parse(JSON.stringify(state.currentPage.components));
          const result = removeComponent(updatedComponents, id);

          return {
            currentPage: {
              ...state.currentPage,
              components: result
            },
            selectedId: null
          };
        }),

        duplicateComponent: (id) => set((state) => {
          if (!state.currentPage) return state;

          const components = JSON.parse(JSON.stringify(state.currentPage.components));
          const component = findComponentById(components, id);

          if (!component) return state;

          // 创建组件副本并生成新ID
          const duplicate = JSON.parse(JSON.stringify(component));
          duplicate.id = uuidv4();

          // 如果是根组件的直接子组件
          if (component.parent === undefined) {
            const rootChildren = components.children || [];
            const index = rootChildren.findIndex((c: { id: string; }) => c.id === id);

            return {
              currentPage: {
                ...state.currentPage,
                components: {
                  ...components,
                  children: [
                    ...rootChildren.slice(0, index + 1),
                    duplicate,
                    ...rootChildren.slice(index + 1)
                  ]
                }
              },
              selectedId: duplicate.id
            };
          }

          // 否则找到父组件并添加到其子组件中
          const parentComponent = findComponentById(components, component.parent!);
          if (parentComponent && parentComponent.children) {
            const index = parentComponent.children.findIndex(c => c.id === id);
            parentComponent.children.splice(index + 1, 0, duplicate);
          }

          return {
            currentPage: {
              ...state.currentPage,
              components
            },
            selectedId: duplicate.id
          };
        }),

        moveComponent: (id, newParentId, index) => set((state) => {
          if (!state.currentPage) return state;

          const components = JSON.parse(JSON.stringify(state.currentPage.components));
          const component = findComponentById(components, id);

          if (!component) return state;

          // 首先从原位置删除组件
          const updatedComponents = removeComponent(components, id);

          // 然后在新位置添加组件
          const newParent = findComponentById(updatedComponents, newParentId);
          if (newParent) {
            newParent.children = newParent.children || [];
            if (index !== undefined) {
              newParent.children.splice(index, 0, component);
            } else {
              newParent.children.push(component);
            }
            component.parent = newParentId;
          }

          return {
            currentPage: {
              ...state.currentPage,
              components: updatedComponents
            }
          };
        }),

        // 选择操作
        selectComponent: (id) => set({ selectedId: id }),

        hoverComponent: (id) => set({ hoveredId: id }),

        getSelectedComponent: () => {
          const state = get();
          if (!state.currentPage || !state.selectedId) return null;

          return findComponentById(state.currentPage.components, state.selectedId);
        },

        // 编辑器设置
        setMode: (mode) => set({ mode }),

        setCanvasScale: (canvasScale) => set({ canvasScale }),

        toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

        // 导出和导入
        getPageJSON: () => {
          const { currentPage } = get();
          if (!currentPage) throw new Error('No active page');

          return currentPage;
        },

        importPageJSON: (json) => set({
          currentPage: json,
          selectedId: null
        })
      }),
      {
        name: 'lowcode-editor-storage',
        partialize: (state) => ({
          mode: state.mode,
          canvasScale: state.canvasScale,
          showGrid: state.showGrid,
        })
      }
    )
  )
);
