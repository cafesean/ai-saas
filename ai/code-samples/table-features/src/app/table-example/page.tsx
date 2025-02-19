import { DataTable } from "./components/DataTable"
import { useTableColumns } from "../../hooks/useTableColumns"
import { type User } from "../../types"

const SAMPLE_DATA: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
]

export default function TableExamplePage() {
  const columns = useTableColumns({
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
    ],
  })

  return (
    <div className="container mx-auto py-10">
      <DataTable data={SAMPLE_DATA} columns={columns} />
    </div>
  )
} 