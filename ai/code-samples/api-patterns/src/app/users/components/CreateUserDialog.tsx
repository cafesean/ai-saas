"use client"

import { useState } from "react"
import { api } from "../../../utils/trpc"
import { type RouterInputs } from "../../../utils/trpc"
import { insertUserSchema } from "../../../server/db/schema"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/form/Button"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
}

type CreateUserInput = RouterInputs["user"]["create"]

export function CreateUserDialog({ isOpen, onClose }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: "",
    email: "",
  })

  const utils = api.useContext()
  const { mutate: createUser, isLoading } = api.user.create.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate()
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = insertUserSchema.safeParse(formData)
    if (!result.success) return

    createUser(result.data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 