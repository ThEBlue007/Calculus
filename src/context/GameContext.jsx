import React, { createContext, useState, useEffect } from 'react';

export const GameContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const GameProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [drachmas, setDrachmas] = useState(0);
  const [upgrades, setUpgrades] = useState({ athena: 1, chronos: 1, hermes: 1, lhopital: 1 });
  const [relics, setRelics] = useState({ midas: false, aegis: false, sandals: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let id = localStorage.getItem('ziggurat_user_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ziggurat_user_id', id);
    }
    setUserId(id);
    syncUser(id);
  }, []);

  const syncUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      });
      const data = await res.json();
      if (data) {
        setDrachmas(data.drachmas || 0);
        if (data.upgrades) setUpgrades(data.upgrades);
        if (data.relics) setRelics(data.relics);
      }
    } catch (err) {
      console.error('Failed to sync user', err);
    } finally {
      setLoading(false);
    }
  };

  const rewardUser = async (score, mode, directDrachmas = null) => {
    try {
      const res = await fetch(`${API_URL}/user/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score, mode, directDrachmas })
      });
      const data = await res.json();
      if (data.totalDrachmas !== undefined) {
        setDrachmas(data.totalDrachmas);
      }
      return data.drachmasEarned;
    } catch (err) {
      console.error('Failed to reward user', err);
      return 0;
    }
  };

  const buyUpgrade = async (skill) => {
    try {
      const res = await fetch(`${API_URL}/user/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skill })
      });
      const data = await res.json();
      if (data.success) {
        setDrachmas(data.user.drachmas);
        if (data.user.upgrades) setUpgrades(data.user.upgrades);
        if (data.user.relics) setRelics(data.user.relics);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to buy upgrade', err);
      return false;
    }
  };

  return (
    <GameContext.Provider value={{ userId, drachmas, upgrades, relics, loading, rewardUser, buyUpgrade }}>
      {children}
    </GameContext.Provider>
  );
};
