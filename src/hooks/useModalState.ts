import React from 'react';

interface ModalState<T> {
  isModalOpen: boolean;
  deleteConfirmOpen: boolean;
  isConfirming: boolean;
  selectedItem: T | null;
  viewingItem: T | null;
}

export function useModalState<T>() {
  const [state, setState] = React.useState<ModalState<T>>({
    isModalOpen: false,
    deleteConfirmOpen: false,
    isConfirming: false,
    selectedItem: null,
    viewingItem: null,
  });

  const openModal = () => setState((prev: ModalState<T>) => ({ ...prev, isModalOpen: true }));
  const closeModal = () => setState((prev: ModalState<T>) => ({ 
    ...prev, 
    isModalOpen: false,
    isConfirming: false,
    selectedItem: null 
  }));

  const startConfirming = () => setState((prev: ModalState<T>) => ({ ...prev, isConfirming: true }));
  const stopConfirming = () => setState((prev: ModalState<T>) => ({ ...prev, isConfirming: false }));

  const openDeleteConfirm = (item: T) => setState((prev: ModalState<T>) => ({ 
    ...prev, 
    deleteConfirmOpen: true,
    selectedItem: item 
  }));
  const closeDeleteConfirm = () => setState((prev: ModalState<T>) => ({ 
    ...prev, 
    deleteConfirmOpen: false,
    selectedItem: null 
  }));

  const selectItem = (item: T) => setState((prev: ModalState<T>) => ({ 
    ...prev, 
    selectedItem: item,
    isModalOpen: true 
  }));
  const viewItem = (item: T | null) => setState((prev: ModalState<T>) => ({ 
    ...prev, 
    viewingItem: item 
  }));

  return {
    ...state,
    openModal,
    closeModal,
    startConfirming,
    stopConfirming,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectItem,
    viewItem,
  };
} 