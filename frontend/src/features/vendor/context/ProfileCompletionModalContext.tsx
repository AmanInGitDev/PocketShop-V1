import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ProfileCompletionModalContextValue = {
  showProfileCompletionModal: boolean;
  openProfileCompletionModal: () => void;
  closeProfileCompletionModal: () => void;
};

const ProfileCompletionModalContext = createContext<ProfileCompletionModalContextValue | null>(null);

export function ProfileCompletionModalProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const openProfileCompletionModal = useCallback(() => setShow(true), []);
  const closeProfileCompletionModal = useCallback(() => setShow(false), []);

  return (
    <ProfileCompletionModalContext.Provider
      value={{
        showProfileCompletionModal: show,
        openProfileCompletionModal,
        closeProfileCompletionModal,
      }}
    >
      {children}
    </ProfileCompletionModalContext.Provider>
  );
}

export function useProfileCompletionModal() {
  const ctx = useContext(ProfileCompletionModalContext);
  return ctx ?? {
    showProfileCompletionModal: false,
    openProfileCompletionModal: () => {},
    closeProfileCompletionModal: () => {},
  };
}
