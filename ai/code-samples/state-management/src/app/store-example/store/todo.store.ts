"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type Todo } from "../types"

interface TodoState {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (todo) => set((state) => ({ 
        todos: [...state.todos, todo] 
      })),
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      })),
      removeTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      })),
    }),
    {
      name: "todo-storage",
    }
  )
) 