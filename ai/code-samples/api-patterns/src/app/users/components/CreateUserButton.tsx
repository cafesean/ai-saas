"use client"

import { useState } from "react"
import { Button } from "@/components/form/Button"
import { CreateUserDialog } from "./CreateUserDialog"

export function CreateUserButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Create User
      </Button>

      <CreateUserDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
} 