import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiServices } from '../api';
import type { Equipment, Checkout, User, Manager, ActivityEntry, Category } from '../types';
import {
  CATEGORIES,
  EQUIPMENT,
  CHECKOUTS,
  USERS,
  MANAGERS,
  ACTIVITY_LOG,
} from '../data/mockData';
import { env } from '../config/env';

// Flag type for notifications
export type FlagData = { id: string; title: string; description: string; type: 'success' | 'info' };

interface DataContextValue {
  // Data
  equipment: Equipment[];
  checkouts: Checkout[];
  users: User[];
  managers: Manager[];
  activityLog: ActivityEntry[];
  categories: Category[];
  currentManager: Manager;
  isLoading: boolean;

  // Flags
  flags: FlagData[];
  addFlag: (f: Omit<FlagData, 'id'>) => void;
  dismissFlag: (id: string) => void;

  // Equipment handlers
  handleAddEquipment: (e: Omit<Equipment, 'id' | 'conditionNotes'>) => Promise<void>;
  handleEditItem: (id: string, name: string, categoryId: string) => Promise<void>;
  handleArchive: (id: string, reason: string) => Promise<void>;
  handleAddGeneralNote: (equipmentId: string, note: string) => Promise<void>;

  // Checkout handlers
  handleCheckOut: (co: Omit<Checkout, 'id'>) => Promise<void>;
  handleCheckIn: (checkoutId: string, note: string) => Promise<void>;
  handleSendReminder: (checkoutId: string) => Promise<void>;

  // User handlers
  handleAddUser: (u: Omit<User, 'id'>) => Promise<void>;
  handleEditUser: (id: string, user: Omit<User, 'id'>) => Promise<void>;

  // Manager handlers
  handleAddManager: (email: string) => Promise<void>;
  handleEditManager: (id: string, manager: Omit<Manager, 'id'>) => Promise<void>;
  handleRemoveManager: (id: string) => Promise<void>;
  handleUpdateProfile: (manager: Omit<Manager, 'id'>) => Promise<void>;

  // Category handlers
  handleUpdateCategory: (id: string, name: string, color: string, bgColor?: string) => Promise<void>;

  // Activity
  addActivity: (entry: Omit<ActivityEntry, 'id'>) => Promise<void>;

  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Use mock data initially - will be replaced with API data when Supabase is configured
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [checkouts, setCheckouts] = useState<Checkout[]>(CHECKOUTS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [managers, setManagers] = useState<Manager[]>(MANAGERS);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(ACTIVITY_LOG);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [flags, setFlags] = useState<FlagData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useApi, setUseApi] = useState(false);

  const currentManager = managers[0];

  // Check if we should use API
  useEffect(() => {
    const shouldUseApi = Boolean(env.supabase.url && env.supabase.anonKey && env.apiBackend === 'supabase');
    setUseApi(shouldUseApi);

    if (shouldUseApi) {
      console.log('Supabase configured, using API services');
      loadDataFromApi();
    } else {
      console.log('Using mock data (Supabase not configured)');
    }
  }, []);

  // Load data from API
  const loadDataFromApi = useCallback(async () => {
    if (!useApi && !(env.supabase.url && env.supabase.anonKey)) return;

    setIsLoading(true);
    try {
      const services = getApiServices();
      const [
        equipmentResult,
        checkoutsResult,
        usersResult,
        managersResult,
        activitiesResult,
        categoriesResult,
      ] = await Promise.all([
        services.equipment.getAll(),
        services.checkouts.getAll(),
        services.users.getAll(),
        services.managers.getAll(),
        services.activities.getAll(),
        services.categories.getAll(),
      ]);

      if (equipmentResult.status === 'success' && equipmentResult.data) {
        setEquipment(equipmentResult.data);
      }
      if (checkoutsResult.status === 'success' && checkoutsResult.data) {
        setCheckouts(checkoutsResult.data);
      }
      if (usersResult.status === 'success' && usersResult.data) {
        setUsers(usersResult.data);
      }
      if (managersResult.status === 'success' && managersResult.data) {
        setManagers(managersResult.data);
      }
      if (activitiesResult.status === 'success' && activitiesResult.data) {
        setActivityLog(activitiesResult.data);
      }
      if (categoriesResult.status === 'success' && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (err) {
      console.error('Failed to load data from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [useApi]);

  // Flag handlers
  const addFlag = useCallback((f: Omit<FlagData, 'id'>) => {
    const id = Date.now().toString();
    setFlags(prev => [...prev, { ...f, id }]);
    setTimeout(() => setFlags(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  const dismissFlag = useCallback((id: string) => {
    setFlags(prev => prev.filter(f => f.id !== id));
  }, []);

  // Activity handler
  const addActivity = useCallback(async (entry: Omit<ActivityEntry, 'id'>) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.activities.create({
        equipmentId: entry.equipmentId,
        action: entry.action,
        actorName: entry.actorName,
        userId: entry.userId,
        note: entry.note,
      });
      if (result.status === 'success' && result.data) {
        setActivityLog(prev => [result.data!, ...prev]);
      }
    } else {
      setActivityLog(prev => [{ ...entry, id: `a-${Date.now()}` }, ...prev]);
    }
  }, [useApi]);

  // Equipment handlers
  const handleAddEquipment = useCallback(async (e: Omit<Equipment, 'id' | 'conditionNotes'>) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.equipment.create({
        name: e.name,
        tagNumber: e.tagNumber,
        categoryId: e.categoryId,
      });
      if (result.status === 'success' && result.data) {
        setEquipment(prev => [...prev, result.data!]);
        await addActivity({ timestamp: new Date().toISOString(), equipmentId: result.data.id, action: 'added', actorName: currentManager.name });
        addFlag({ type: 'success', title: 'Item Added', description: `${e.name} ${e.tagNumber}` });
      } else {
        addFlag({ type: 'info', title: 'Error', description: result.error?.message || 'Failed to add item' });
      }
    } else {
      const newItem: Equipment = { ...e, id: `eq-${Date.now()}`, conditionNotes: [] };
      setEquipment(prev => [...prev, newItem]);
      await addActivity({ timestamp: new Date().toISOString(), equipmentId: newItem.id, action: 'added', actorName: currentManager.name });
      addFlag({ type: 'success', title: 'Item Added', description: `${e.name} ${e.tagNumber}` });
    }
  }, [useApi, addActivity, addFlag, currentManager.name]);

  const handleEditItem = useCallback(async (id: string, name: string, categoryId: string) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.equipment.update(id, { name, categoryId });
      if (result.status === 'success' && result.data) {
        setEquipment(prev => prev.map(e => e.id === id ? result.data! : e));
      }
    } else {
      setEquipment(prev => prev.map(e => e.id === id ? { ...e, name, categoryId } : e));
    }
    await addActivity({ timestamp: new Date().toISOString(), equipmentId: id, action: 'note', actorName: currentManager.name, note: `Item updated: name="${name}"` });
    addFlag({ type: 'success', title: 'Item Updated', description: name });
  }, [useApi, addActivity, addFlag, currentManager.name]);

  const handleArchive = useCallback(async (id: string, reason: string) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.equipment.archive(id, reason);
      if (result.status === 'success' && result.data) {
        setEquipment(prev => prev.map(e => e.id === id ? result.data! : e));
      }
    } else {
      setEquipment(prev => prev.map(e => e.id === id ? { ...e, status: 'archived', archivedReason: reason } : e));
    }
    await addActivity({ timestamp: new Date().toISOString(), equipmentId: id, action: 'archived', actorName: currentManager.name, note: reason });
    addFlag({ type: 'info', title: 'Item Archived', description: reason });
  }, [useApi, addActivity, addFlag, currentManager.name]);

  const handleAddGeneralNote = useCallback(async (equipmentId: string, note: string) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.equipment.addConditionNote(equipmentId, note);
      if (result.status === 'success' && result.data) {
        setEquipment(prev => prev.map(e => e.id === equipmentId ? result.data! : e));
      }
    } else {
      setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, conditionNotes: [...e.conditionNotes, note] } : e));
    }
    await addActivity({ timestamp: new Date().toISOString(), equipmentId, action: 'note', actorName: currentManager.name, note });
    addFlag({ type: 'success', title: 'Note Added', description: note.length > 48 ? `${note.slice(0, 48)}…` : note });
  }, [useApi, addActivity, addFlag, currentManager.name]);

  // Checkout handlers
  const handleCheckOut = useCallback(async (co: Omit<Checkout, 'id'>) => {
    const borrower = users.find(u => u.id === co.userId);
    const item = equipment.find(e => e.id === co.equipmentId);

    if (useApi) {
      const services = getApiServices();
      const result = await services.checkouts.create({
        equipmentId: co.equipmentId,
        userId: co.userId,
        dueAt: co.dueAt,
        conditionNoteOut: co.conditionNoteOut,
        checkedOutBy: currentManager.name,
      });
      if (result.status === 'success' && result.data) {
        setCheckouts(prev => [...prev, result.data!]);
        // Update equipment status
        await services.equipment.update(co.equipmentId, { status: 'checked_out' });
        setEquipment(prev => prev.map(e => e.id === co.equipmentId ? { ...e, status: 'checked_out' } : e));
      }
    } else {
      const id = `co-${Date.now()}`;
      setCheckouts(prev => [...prev, { ...co, id }]);
      setEquipment(prev => prev.map(e => e.id === co.equipmentId ? { ...e, status: 'checked_out' } : e));
    }

    await addActivity({ timestamp: new Date().toISOString(), equipmentId: co.equipmentId, action: 'check_out', actorName: currentManager.name, userId: co.userId, note: co.conditionNoteOut || undefined });
    addFlag({ type: 'success', title: 'Checked Out', description: `${item?.name} ${item?.tagNumber} → ${borrower?.fullName ?? 'user'}` });
  }, [useApi, users, equipment, addActivity, addFlag, currentManager.name]);

  const handleCheckIn = useCallback(async (checkoutId: string, note: string) => {
    const co = checkouts.find(c => c.id === checkoutId);
    if (!co) return;

    const item = equipment.find(e => e.id === co.equipmentId);

    if (useApi) {
      const services = getApiServices();
      await services.checkouts.checkIn(checkoutId, {
        conditionNoteIn: note || undefined,
        checkedInBy: currentManager.name,
      });
      // Update equipment status and add condition note if provided
      if (note) {
        await services.equipment.addConditionNote(co.equipmentId, note);
      }
      await services.equipment.update(co.equipmentId, { status: 'available' });
      setCheckouts(prev => prev.filter(c => c.id !== checkoutId));
      setEquipment(prev => prev.map(e => e.id === co.equipmentId
        ? { ...e, status: 'available', conditionNotes: note ? [...e.conditionNotes, note] : e.conditionNotes }
        : e));
    } else {
      setCheckouts(prev => prev.filter(c => c.id !== checkoutId));
      setEquipment(prev => prev.map(e => e.id === co.equipmentId
        ? { ...e, status: 'available', conditionNotes: note ? [...e.conditionNotes, note] : e.conditionNotes }
        : e));
    }

    await addActivity({ timestamp: new Date().toISOString(), equipmentId: co.equipmentId, action: 'check_in', actorName: currentManager.name, userId: co.userId, note: note || undefined });
    addFlag({ type: 'success', title: 'Returned', description: `${item?.name} ${item?.tagNumber} is now available` });
  }, [useApi, checkouts, equipment, addActivity, addFlag, currentManager.name]);

  const handleSendReminder = useCallback(async (checkoutId: string) => {
    const co = checkouts.find(c => c.id === checkoutId);
    if (!co) return;

    const item = equipment.find(e => e.id === co.equipmentId);
    const borrower = users.find(u => u.id === co.userId);

    if (useApi) {
      const services = getApiServices();
      await services.checkouts.sendReminder(checkoutId);
    }

    await addActivity({ timestamp: new Date().toISOString(), equipmentId: co.equipmentId, action: 'reminder', actorName: currentManager.name, userId: co.userId });
    addFlag({ type: 'info', title: 'Reminder Sent', description: `Twilio SMS + email → ${borrower?.fullName} for ${item?.name} ${item?.tagNumber}` });
  }, [useApi, checkouts, equipment, users, addActivity, addFlag, currentManager.name]);

  // User handlers
  const handleAddUser = useCallback(async (u: Omit<User, 'id'>) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.users.create(u);
      if (result.status === 'success' && result.data) {
        setUsers(prev => [...prev, result.data!]);
      }
    } else {
      setUsers(prev => [...prev, { ...u, id: `u-${Date.now()}` }]);
    }
    addFlag({ type: 'success', title: 'Student Added', description: u.fullName });
  }, [useApi, addFlag]);

  const handleEditUser = useCallback(async (id: string, user: Omit<User, 'id'>) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.users.update(id, user);
      if (result.status === 'success' && result.data) {
        setUsers(prev => prev.map(u => u.id === id ? result.data! : u));
      }
    } else {
      setUsers(prev => prev.map(u => u.id === id ? { ...user, id } : u));
    }
    addFlag({ type: 'success', title: 'Student Updated', description: user.fullName });
  }, [useApi, addFlag]);

  // Manager handlers
  const handleAddManager = useCallback(async (email: string) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.managers.create({
        name: email.split('@')[0],
        email,
        role: 'manager',
      });
      if (result.status === 'success' && result.data) {
        setManagers(prev => [...prev, result.data!]);
      }
    } else {
      setManagers(prev => [...prev, { id: `m-${Date.now()}`, name: email.split('@')[0], email, role: 'manager' }]);
    }
    addFlag({ type: 'success', title: 'Manager Added', description: email });
  }, [useApi, addFlag]);

  const handleEditManager = useCallback(async (id: string, manager: Omit<Manager, 'id'>) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.managers.update(id, manager);
      if (result.status === 'success' && result.data) {
        setManagers(prev => prev.map(m => m.id === id ? result.data! : m));
      }
    } else {
      setManagers(prev => prev.map(m => m.id === id ? { ...manager, id } : m));
    }
    addFlag({ type: 'success', title: 'Manager Updated', description: manager.email });
  }, [useApi, addFlag]);

  const handleRemoveManager = useCallback(async (id: string) => {
    if (useApi) {
      const services = getApiServices();
      await services.managers.remove(id);
    }
    setManagers(prev => prev.filter(m => m.id !== id));
    addFlag({ type: 'info', title: 'Manager Removed', description: '' });
  }, [useApi, addFlag]);

  const handleUpdateProfile = useCallback(async (manager: Omit<Manager, 'id'>) => {
    const id = currentManager.id;
    if (useApi) {
      const services = getApiServices();
      const result = await services.managers.update(id, manager);
      if (result.status === 'success' && result.data) {
        setManagers(prev => prev.map(m => m.id === id ? result.data! : m));
      }
    } else {
      setManagers(prev => prev.map(m => m.id === id ? { ...manager, id } : m));
    }
    addFlag({ type: 'success', title: 'Profile Updated', description: manager.email });
  }, [useApi, currentManager.id, addFlag]);

  // Category handler
  const handleUpdateCategory = useCallback(async (id: string, name: string, color: string, bgColor?: string) => {
    if (useApi) {
      const services = getApiServices();
      const result = await services.categories.update(id, { name, color, bgColor });
      if (result.status === 'success' && result.data) {
        setCategories(prev => prev.map(c => c.id === id ? result.data! : c));
      }
    } else {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name, color, ...(bgColor ? { bgColor } : {}) } : c));
    }
    addFlag({ type: 'success', title: 'Category Updated', description: `${name} column updated` });
  }, [useApi, addFlag]);

  const value: DataContextValue = {
    equipment,
    checkouts,
    users,
    managers,
    activityLog,
    categories,
    currentManager,
    isLoading,
    flags,
    addFlag,
    dismissFlag,
    handleAddEquipment,
    handleEditItem,
    handleArchive,
    handleAddGeneralNote,
    handleCheckOut,
    handleCheckIn,
    handleSendReminder,
    handleAddUser,
    handleEditUser,
    handleAddManager,
    handleEditManager,
    handleRemoveManager,
    handleUpdateProfile,
    handleUpdateCategory,
    addActivity,
    refreshData: loadDataFromApi,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
