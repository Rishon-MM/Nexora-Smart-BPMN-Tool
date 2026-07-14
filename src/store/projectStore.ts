import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuthStore } from './authStore';

interface ChatMessage {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: Date;
  xml?: string;
}

interface Project {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  bpmnXml?: string;
  chatHistory?: ChatMessage[];
  userId: string;
}

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, parentId?: string | null) => Promise<void>;
  updateProject: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (id: string | null) => void;
  saveBpmnDiagram: (projectId: string, xml: string) => Promise<void>;
  saveChatMessage: (projectId: string, message: Omit<ChatMessage, 'id'>) => Promise<void>;
  clearChatHistory: (projectId: string) => Promise<void>;
  loadProjectData: (projectId: string) => Promise<Project | null>;
}

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  isLoading: false,

  fetchProjects: async () => {
    if (isDemo) {
      set({
        projects: [{
          id: 'demo-proj-1', name: 'Demo Project', parentId: null,
          createdAt: new Date(), updatedAt: new Date(), bpmnXml: '', chatHistory: [], userId: 'demo-user'
        }],
        isLoading: false
      });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    set({ isLoading: true });
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(projectsQuery);
      
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        chatHistory: doc.data().chatHistory?.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        }))
      })) as Project[];
      set({ projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (name: string, parentId: string | null = null) => {
    if (isDemo) {
      const newProject = {
        name, parentId, userId: 'demo-user',
        createdAt: new Date(), updatedAt: new Date(), bpmnXml: '', chatHistory: [], id: `demo-${Date.now()}`
      };
      set({ projects: [...get().projects, newProject] });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      const newProject = {
        name,
        parentId,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        bpmnXml: '',
        chatHistory: []
      };
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const projects = [...get().projects, { ...newProject, id: docRef.id }];
      set({ projects });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (id: string, name: string) => {
    if (isDemo) {
      const projects = get().projects.map(p => p.id === id ? { ...p, name, updatedAt: new Date() } : p);
      set({ projects });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', id);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      if (projectData.userId !== user.uid) {
        throw new Error('Unauthorized to update this project');
      }

      await updateDoc(projectRef, {
        name,
        updatedAt: new Date()
      });
      
      const projects = get().projects.map(project =>
        project.id === id ? { ...project, name, updatedAt: new Date() } : project
      );
      set({ projects });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    if (isDemo) {
      const projects = get().projects.filter(p => p.id !== id && p.parentId !== id);
      set({ projects, selectedProjectId: get().selectedProjectId === id ? null : get().selectedProjectId });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', id);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      if (projectData.userId !== user.uid) {
        throw new Error('Unauthorized to delete this project');
      }

      await deleteDoc(projectRef);
      
      // Delete subprojects
      const subprojects = get().projects.filter(p => p.parentId === id);
      for (const subproject of subprojects) {
        if (subproject.userId === user.uid) {
          await deleteDoc(doc(db, 'projects', subproject.id));
        }
      }
      
      const projects = get().projects.filter(project => 
        project.id !== id && project.parentId !== id
      );
      set({ projects });
      
      if (get().selectedProjectId === id) {
        set({ selectedProjectId: null });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  setSelectedProject: (id: string | null) => {
    set({ selectedProjectId: id });
  },

  saveBpmnDiagram: async (projectId: string, xml: string) => {
    if (isDemo) {
      const projects = get().projects.map(p => p.id === projectId ? { ...p, bpmnXml: xml, updatedAt: new Date() } : p);
      set({ projects });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      if (projectData.userId !== user.uid) {
        throw new Error('Unauthorized to update this project');
      }

      await updateDoc(projectRef, {
        bpmnXml: xml,
        updatedAt: new Date()
      });
      
      const projects = get().projects.map(project =>
        project.id === projectId ? { ...project, bpmnXml: xml, updatedAt: new Date() } : project
      );
      set({ projects });
    } catch (error) {
      console.error('Error saving BPMN diagram:', error);
      throw error;
    }
  },

  saveChatMessage: async (projectId: string, message: Omit<ChatMessage, 'id'>) => {
    if (isDemo) {
      const projects = get().projects.map(p => p.id === projectId ? { ...p, chatHistory: [...(p.chatHistory || []), { ...message, id: Date.now().toString() }], updatedAt: new Date() } : p);
      set({ projects });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      if (projectData.userId !== user.uid) {
        throw new Error('Unauthorized to update this project');
      }

      const project = get().projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found in state');
      }

      const chatHistory = [...(project.chatHistory || []), { ...message, id: Date.now().toString() }];
      
      await updateDoc(projectRef, {
        chatHistory,
        updatedAt: new Date()
      });

      const projects = get().projects.map(p =>
        p.id === projectId ? { ...p, chatHistory, updatedAt: new Date() } : p
      );
      set({ projects });
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  clearChatHistory: async (projectId: string) => {
    if (isDemo) {
      const projects = get().projects.map(p => p.id === projectId ? { ...p, chatHistory: [], updatedAt: new Date() } : p);
      set({ projects });
      return;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      if (projectData.userId !== user.uid) {
        throw new Error('Unauthorized to update this project');
      }

      await updateDoc(projectRef, {
        chatHistory: [],
        updatedAt: new Date()
      });

      const projects = get().projects.map(p =>
        p.id === projectId ? { ...p, chatHistory: [], updatedAt: new Date() } : p
      );
      set({ projects });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  },

  loadProjectData: async (projectId: string) => {
    if (isDemo) {
      return get().projects.find(p => p.id === projectId) || null;
    }
    const user = useAuthStore.getState().user;
    if (!user) {
      console.error('No user authenticated');
      return null;
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const data = projectDoc.data();
      
      if (data.userId !== user.uid) {
        throw new Error('Unauthorized to access this project');
      }
      
      return {
        id: projectDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        chatHistory: data.chatHistory?.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        }))
      } as Project;
    } catch (error) {
      console.error('Error loading project data:', error);
      return null;
    }
  }
}));