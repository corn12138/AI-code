import { basicComponents } from '@/components/LowCodeComponents/Basic';
import { formComponents } from '@/components/LowCodeComponents/Form';
import { layoutComponents } from '@/components/LowCodeComponents/Layout';
import { ComponentRegistration } from '@/types';
import { create } from 'zustand';

interface ComponentsStore {
  components: ComponentRegistration[];
  getComponentByType: (type: string) => ComponentRegistration | undefined;
  categories: string[];
  getComponentsByCategory: (category: string) => ComponentRegistration[];
}

export const useComponentsStore = create<ComponentsStore>((set, get) => {
  // 所有可用组件的集合
  const allComponents = [
    ...basicComponents,
    ...layoutComponents,
    ...formComponents,
  ];

  // 所有分类的集合
  const allCategories = Array.from(new Set(allComponents.map(comp => comp.category)));

  return {
    components: allComponents,

    getComponentByType: (type) => {
      return get().components.find(c => c.type === type);
    },

    categories: allCategories,

    getComponentsByCategory: (category) => {
      return get().components.filter(c => c.category === category);
    }
  };
});
