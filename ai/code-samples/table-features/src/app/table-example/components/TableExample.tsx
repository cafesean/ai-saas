import { type FC } from "react"
import { DataTable } from "./DataTable"
import { useTableColumns } from "../hooks/useTableColumns"
import { type User } from "../../../types"

const SAMPLE_DATA: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
]

export const TableExample: FC = () => {
  const columns = useTableColumns({
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
    ],
  })

  return <DataTable data={SAMPLE_DATA} columns={columns} />
} 