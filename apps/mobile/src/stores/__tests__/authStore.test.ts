import { describe, expect, it, beforeEach } from 'vitest';

import { useAuthStore } from '../auth/useAuthStore';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const sampleUser = {
  id: 'user-1',
  username: 'tester',
  email: 'tester@example.com',
  permissions: ['read'],
  role: 'user',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState(initialState);
  });

  it('logs in and logs out correctly', () => {
    useAuthStore.getState().login(sampleUser, 'token-123', 'refresh-456');

    const loggedIn = useAuthStore.getState();
    expect(loggedIn.isAuthenticated).toBe(true);
    expect(loggedIn.user?.username).toBe('tester');
    expect(loggedIn.token).toBe('token-123');

    loggedIn.logout();
    const loggedOut = useAuthStore.getState();
    expect(loggedOut.isAuthenticated).toBe(false);
    expect(loggedOut.user).toBeNull();
    expect(loggedOut.token).toBeNull();
  });

  it('updates profile fields when user is present', () => {
    const store = useAuthStore.getState();
    store.login(sampleUser, 'token-123');

    store.updateProfile({ username: 'updated', profile: { nickname: 'Tester' } });

    const updated = useAuthStore.getState().user;
    expect(updated?.username).toBe('updated');
    expect(updated?.profile).toEqual({ nickname: 'Tester' });
  });

  it('checks permissions and role helpers', () => {
    const store = useAuthStore.getState();
    store.login({ ...sampleUser, permissions: ['read', 'write'], role: 'admin' }, 'token');

    expect(store.hasPermission('write')).toBe(true);
    expect(store.isRole('admin')).toBe(true);
  });
});
