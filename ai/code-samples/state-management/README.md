# State Management Patterns Sample

This sample demonstrates state management patterns in a Next.js application using Zustand.

## Features

- Local component state with useState
- Global state management with Zustand
- Persistent storage with zustand/middleware
- Type-safe state management
- Optimistic updates
- Proper state organization

## Key Components

1. `TodoList`: Main component demonstrating state usage
2. `TodoItem`: Child component accessing global state
3. `todo.store.ts`: Zustand store with persistence
4. Local state for form handling

## Usage

```tsx
// Access store in components
const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore()

// Add new todo
addTodo({
  id: crypto.randomUUID(),
  text: "New todo",
  completed: false,
})

// Toggle todo
toggleTodo(todoId)

// Remove todo
removeTodo(todoId)
```

## Implementation Details

- Store colocated with feature
- Persistent storage using zustand/middleware
- Type-safe state and actions
- Optimistic UI updates
- Clean component architecture

## Dependencies

- Next.js 14
- Zustand
- TypeScript 