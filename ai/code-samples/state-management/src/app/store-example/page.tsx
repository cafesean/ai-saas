import { TodoList } from "./components/TodoList"

export default function StoreExamplePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">State Management Patterns</h1>
        <TodoList />
      </div>
    </div>
  )
} 