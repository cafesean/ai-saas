"use client"

import { Button } from "@/components/form/Button"
import { useTodoStore } from "../store/todo.store"
import { type Todo } from "../types"

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, removeTodo } = useTodoStore()

  return (
    <li className="flex items-center gap-2 p-2 border rounded">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="h-4 w-4"
      />
      <span className={todo.completed ? "line-through" : ""}>
        {todo.text}
      </span>
      <Button
        variant="outline"
        onClick={() => removeTodo(todo.id)}
        className="ml-auto"
      >
        Delete
      </Button>
    </li>
  )
} 