import { ConfirmDeleteButton } from "./components/ConfirmDeleteButton"

export default function ModalExamplePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Modal Patterns</h1>
        <div className="flex gap-4">
          <ConfirmDeleteButton 
            itemName="Example Item"
            onConfirm={() => console.log("Item deleted")}
          />
        </div>
      </div>
    </div>
  )
} 