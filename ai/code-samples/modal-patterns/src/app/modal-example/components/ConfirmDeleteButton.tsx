"use client"

import { useState } from "react"
import { Button } from "@/components/form/Button"
import { ConfirmationDialog } from "./ConfirmationDialog"

interface ConfirmDeleteButtonProps {
  itemName: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmDeleteButton({ itemName, onConfirm }: ConfirmDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to delete:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="h-7 px-2 text-xs font-bold"
      >
        Delete
      </Button>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Delete"
        description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </>
  )
} 