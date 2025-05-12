import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/db";
import Link from "next/link";
import { AddUserForm } from "./add-user-form";
import { UsersTable } from "./users-table";

export const dynamic = 'force-dynamic';

export default async function UsersManagementPage() {
  const users = await getUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage DataMatch users
          </p>
        </div>
        <div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User List */}
        <div>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>All registered users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable users={users} />
            </CardContent>
          </Card>
        </div>

        {/* Add User Form */}
        <div>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Create a new user in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <AddUserForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
