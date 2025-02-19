"use client"

import { api } from "../../../utils/trpc"
import { UserListItem } from "./UserListItem"
import { type UsersOutput } from "../../../types/api"

export function UserList() {
  const { data: users, isLoading } = api.user.list.useQuery<UsersOutput>()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <ul className="space-y-2">
      {users?.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  )
} 