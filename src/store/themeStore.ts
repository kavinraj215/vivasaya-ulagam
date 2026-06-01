import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface ThemeSection {
  id: string; // Temporary ID for drag and drop
  type: string;
  position: number;
  settings: Record<string, any>;
  isVisible: boolean;
  _id?: string; // DB ID
}

export interface ThemeState {
  themeId: string | null;
  name: string;
  globalSettings: Record<string, any>;
  sections: ThemeSection[];
  activeSectionId: string | null;
  history: {
    past: Omit<ThemeState, 'history' | 'activeSectionId' | 'themeId'>[];
    future: Omit<ThemeState, 'history' | 'activeSectionId' | 'themeId'>[];
  };
}

interface ThemeActions {
  setTheme: (theme: Partial<ThemeState>) => void;
  setSections: (sections: ThemeSection[]) => void;
  addSection: (type: string) => void;
  removeSection: (id: string) => void;
  updateSectionSettings: (id: string, settings: Record<string, any>) => void;
  reorderSections: (activeId: string, overId: string) => void;
  setActiveSection: (id: string | null) => void;
  updateGlobalSettings: (settings: Record<string, any>) => void;
  undo: () => void;
  redo: () => void;
  saveThemeState: () => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  themeId: null,
  name: 'New Theme',
  globalSettings: {
    colors: { primary: '#0ea5e9', background: '#ffffff', text: '#0f172a' },
    typography: { fontFamily: 'Poppins' },
  },
  sections: [],
  activeSectionId: null,
  history: { past: [], future: [] },

  saveThemeState: () => {
    set((state) => {
      const currentSnapshot = {
        name: state.name,
        globalSettings: state.globalSettings,
        sections: state.sections,
      };
      return {
        history: {
          past: [...state.history.past, currentSnapshot].slice(-20),
          future: [],
        },
      };
    });
  },

  setTheme: (theme) => set((state) => ({ ...state, ...theme })),
  
  setSections: (sections) => {
    get().saveThemeState();
    set({ sections });
  },

  addSection: (type) => {
    get().saveThemeState();
    set((state) => {
      const newSection: ThemeSection = {
        id: uuidv4(),
        type,
        position: state.sections.length,
        settings: {},
        isVisible: true,
      };
      return { sections: [...state.sections, newSection], activeSectionId: newSection.id };
    });
  },

  removeSection: (id) => {
    get().saveThemeState();
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
      activeSectionId: state.activeSectionId === id ? null : state.activeSectionId,
    }));
  },

  updateSectionSettings: (id, settings) => {
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s)),
    }));
  },

  reorderSections: (activeId, overId) => {
    get().saveThemeState();
    set((state) => {
      const oldIndex = state.sections.findIndex((s) => s.id === activeId);
      const newIndex = state.sections.findIndex((s) => s.id === overId);
      
      const newSections = [...state.sections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);
      
      return {
        sections: newSections.map((s, index) => ({ ...s, position: index })),
      };
    });
  },

  setActiveSection: (id) => set({ activeSectionId: id }),

  updateGlobalSettings: (settings) => {
    get().saveThemeState();
    set((state) => ({
      globalSettings: { ...state.globalSettings, ...settings },
    }));
  },

  undo: () => set((state) => {
    if (state.history.past.length === 0) return state;
    
    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);
    
    const currentSnapshot = {
      name: state.name,
      globalSettings: state.globalSettings,
      sections: state.sections,
    };

    return {
      name: previous.name,
      globalSettings: previous.globalSettings,
      sections: previous.sections,
      history: {
        past: newPast,
        future: [currentSnapshot, ...state.history.future],
      },
    };
  }),

  redo: () => set((state) => {
    if (state.history.future.length === 0) return state;
    
    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    
    const currentSnapshot = {
      name: state.name,
      globalSettings: state.globalSettings,
      sections: state.sections,
    };

    return {
      name: next.name,
      globalSettings: next.globalSettings,
      sections: next.sections,
      history: {
        past: [...state.history.past, currentSnapshot],
        future: newFuture,
      },
    };
  }),
}));
