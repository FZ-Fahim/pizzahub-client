'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '@/types';

interface FavoritesContextType {
  favorites: MenuItem[];
  favoritesCount: number;
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (item: MenuItem) => void;
  removeFavorite: (itemId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'pizzahub_favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveFavorites = (items: MenuItem[]) => {
    setFavorites(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        // ignore
      }
    }
  };

  const isFavorite = (itemId: string): boolean => {
    return favorites.some((fav) => fav._id === itemId);
  };

  const toggleFavorite = (item: MenuItem) => {
    const exists = isFavorite(item._id);
    let updated: MenuItem[];
    if (exists) {
      updated = favorites.filter((fav) => fav._id !== item._id);
    } else {
      updated = [item, ...favorites];
    }
    saveFavorites(updated);
  };

  const removeFavorite = (itemId: string) => {
    const updated = favorites.filter((fav) => fav._id !== itemId);
    saveFavorites(updated);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesProvider;
