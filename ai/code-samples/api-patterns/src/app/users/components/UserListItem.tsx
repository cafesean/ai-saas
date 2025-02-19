"use client"

import { api } from '../../../utils/trpc'
import { Button } from "@/components/form/Button"
import { type UserOutput } from "../../../types/api"

interface UserListItemProps {
  user: UserOutput
}

export function UserListItem({ user }: UserListItemProps) {
  const utils = api.useUtils()
  const { mutate: deleteUser, isLoading } = api.user.delete.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate()
    },
  })

  return (
    <li className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="font-medium">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => deleteUser({ id: user.id })}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </li>
  )
} 