import { api } from "@shared/routes";
let users: any[] = [];
let samples: any[] = [];
let recalls: any[] = [];
let notifications: any[] = [];

export const storage = {
  async getUserByUsername(username: string) {
    return users.find(u => u.username === username);
  },

  async createUser(data: any) {
    const user = { id: users.length + 1, ...data };
    users.push(user);
    return user;
  },

  async getUser(id: number) {
    return users.find(u => u.id === id);
  },

  async updateUser(id: number, data: any) {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    return user;
  },

  async getSamples() {
    return samples;
  },

  async getSample(id: number) {
    return samples.find(s => s.id === id);
  },

  async createSample(data: any) {
    const sample = { id: samples.length + 1, ...data };
    samples.push(sample);
    return sample;
  },

  async updateSample(id: number, data: any) {
  const sample = samples.find(s => s.id === id);
  if (!sample) return null;
  Object.assign(sample, data);
  return sample;
}
,

  async getRecalls() {
    return recalls;
  },

  async createRecall(data: any) {
    const recall = { id: recalls.length + 1, ...data };
    recalls.push(recall);
    return recall;
  },

  async getNotifications(userId?: number) {
    return notifications.filter(n => !userId || n.userId === userId);
  },

  async markNotificationRead() {}
};
