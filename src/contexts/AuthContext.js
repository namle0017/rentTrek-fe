import { createContext } from 'react';

/** Giá trị: { currentUser, isAuthenticated, isLoading, login(tokens), logout() } — xem AuthProvider. */
export const AuthContext = createContext(null);
