import { FormData } from '../types';

const QUEUE_KEY = 'transito_offline_queue';

export const saveToQueue = (data: FormData) => {
  const currentQueue = getQueue();
  currentQueue.push(data);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
};

export const getQueue = (): FormData[] => {
  const stored = localStorage.getItem(QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const removeFromQueue = (id: string) => {
  const currentQueue = getQueue();
  const newQueue = currentQueue.filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};
