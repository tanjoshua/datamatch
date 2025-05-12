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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateUser } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(100, {
    message: "Name must not exceed 100 characters."
  })
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  user: User;
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const router = useRouter();
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const result = await updateUser({
        id: user.id,
        name: values.name,
      });

      if (result.success) {
        toast.success("User updated", {
          description: `${values.name} has been updated successfully.`,
        });
        router.refresh();
        // Programmatically close the dialog
        dialogCloseRef.current?.click();
      } else {
        toast.error("Error", {
          description: result.error || "There was a problem updating the user.",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error", {
        description: "There was a problem updating the user.",
      });
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Update the user&apos;s information.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            {/* Add a hidden DialogClose that we can trigger programmatically */}
            <DialogClose ref={dialogCloseRef} className="hidden" />
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
