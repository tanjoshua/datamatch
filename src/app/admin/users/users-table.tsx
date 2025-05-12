import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/db";

export function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Survey Status</TableHead>
            <TableHead>Added On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No users found. Add your first user to get started.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {user.has_completed_survey ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
