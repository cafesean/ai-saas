import { create } from "zustand"
import { type SortingState } from "@tanstack/react-table"

interface TableState {
  sorting: SortingState
  pageIndex: number
  pageSize: number
  searchTerm: string
  
  // Actions
  setSorting: (sorting: SortingState) => void
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
  setSearchTerm: (term: string) => void
}

export const useTableStore = create<TableState>((set) => ({
  sorting: [],
  pageIndex: 0,
  pageSize: 10,
  searchTerm: "",

  setSorting: (sorting) => set({ sorting }),
  setPageIndex: (pageIndex) => set({ pageIndex }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
})) 