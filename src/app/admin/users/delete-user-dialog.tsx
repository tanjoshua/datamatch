"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUser } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db";

interface DeleteUserDialogProps {
  user: User;
}

export function DeleteUserDialog({ user }: DeleteUserDialogProps) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const result = await deleteUser(user.id);
      
      if (result.success) {
        toast.success("User deleted", {
          description: `${user.name} has been deleted successfully.`,
        });
        router.refresh();
      } else {
        toast.error("Error", {
          description: result.error || "There was a problem deleting the user.",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error", {
        description: "There was a problem deleting the user.",
      });
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {user.name}? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:gap-0">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="button" variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
