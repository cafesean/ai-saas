"use client"

import { useState } from "react"
import { Button } from "@/components/form/Button"
import { useTodoStore } from "../store/todo.store"
import { TodoItem } from "./TodoItem"

export function TodoList() {
  const [newTodo, setNewTodo] = useState("")
  const { todos, addTodo } = useTodoStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    addTodo({
      id: crypto.randomUUID(),
      text: newTodo,
      completed: false,
    })
    setNewTodo("")
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          className="flex-1 px-3 py-1 border rounded"
        />
        <Button type="submit">Add</Button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  )
} 