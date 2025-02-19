import { UserList } from "./components/UserList"
import { CreateUserButton } from "./components/CreateUserButton"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Users</h1>
          <CreateUserButton />
        </div>
        <UserList />
      </div>
    </div>
  )
} 