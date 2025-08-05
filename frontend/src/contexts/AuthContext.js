import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  tokens: null,
  error: null
};

// Actions
const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_ERROR: 'LOAD_USER_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
    case AuthActionTypes.REGISTER_START:
    case AuthActionTypes.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AuthActionTypes.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AuthActionTypes.LOGIN_ERROR:
    case AuthActionTypes.REGISTER_ERROR:
    case AuthActionTypes.LOAD_USER_ERROR:
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Contexte
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  // Charger l'utilisateur depuis le stockage local
  const loadUser = async () => {
    try {
      dispatch({ type: AuthActionTypes.LOAD_USER_START });

      const tokens = storageService.getTokens();
      if (!tokens || !tokens.accessToken) {
        dispatch({ type: AuthActionTypes.LOAD_USER_ERROR, payload: 'No tokens found' });
        return;
      }

      // Vérifier si le token est valide
      const user = await authService.getProfile();
      
      dispatch({
        type: AuthActionTypes.LOAD_USER_SUCCESS,
        payload: { user }
      });

    } catch (error) {
      console.error('Error loading user:', error);
      storageService.clearTokens();
      dispatch({
        type: AuthActionTypes.LOAD_USER_ERROR,
        payload: error.response?.data?.error || 'Failed to load user'
      });
    }
  };

  // Connexion
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.LOGIN_START });

      const response = await authService.login(credentials);
      
      // Stocker les tokens
      storageService.setTokens(response.tokens);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: response
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: AuthActionTypes.LOGIN_ERROR,
        payload: errorMessage
      });
      throw error;
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.REGISTER_START });

      const response = await authService.register(userData);
      
      // Stocker les tokens
      storageService.setTokens(response.tokens);
      
      dispatch({
        type: AuthActionTypes.REGISTER_SUCCESS,
        payload: response
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({
        type: AuthActionTypes.REGISTER_ERROR,
        payload: errorMessage
      });
      throw error;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storageService.clearTokens();
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Réinitialiser le mot de passe
  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // Vérifier l'email
  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token);
      // Recharger l'utilisateur pour mettre à jour is_verified
      if (state.isAuthenticated) {
        await loadUser();
      }
    } catch (error) {
      throw error;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({
        type: AuthActionTypes.UPDATE_USER,
        payload: updatedUser
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Rafraîchir les tokens
  const refreshTokens = async () => {
    try {
      const tokens = storageService.getTokens();
      if (!tokens || !tokens.refreshToken) {
        throw new Error('No refresh token available');
      }

      const newTokens = await authService.refreshToken(tokens.refreshToken);
      storageService.setTokens(newTokens);
      
      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Effacer les erreurs
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Valeurs du contexte
  const value = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    refreshTokens,
    loadUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;