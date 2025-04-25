// contexts/PlayerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlayerType } from '../types';

interface PlayerinfoContextType
{
  selectedAccount: PlayerType | undefined;
  setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
  editProfile: boolean;
  setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
  settingUp2FA: boolean;
  setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlayerinfoContext = createContext<PlayerinfoContextType | undefined>(undefined);

interface PlayerinfoProviderProps
{
  children: ReactNode;
}

export function PlayerinfoProvider({ children }: PlayerinfoProviderProps)
{
  const [selectedAccount, setSelectedAccount] = useState<PlayerType | undefined>(undefined);
  const [editProfile, setEditProfile] = useState(false);
  const [settingUp2FA, setSettingUp2FA] = useState(false);

  return (
    <PlayerinfoContext.Provider value={{
      selectedAccount,
      setSelectedAccount,
      editProfile,
      setEditProfile,
      settingUp2FA,
      setSettingUp2FA
    }}>
      {children}
    </PlayerinfoContext.Provider>
  );
}

export function usePlayerContext()
{
  const context = useContext(PlayerinfoContext);
  if (!context)
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  return context;
}
