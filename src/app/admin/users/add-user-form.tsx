"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addUser, addBulkUsers } from "./actions";
import { useRouter } from "next/navigation";

const singleUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(100, {
    message: "Name must not exceed 100 characters."
  })
});

const bulkUsersSchema = z.object({
  names: z.string().min(2, {
    message: "Please enter at least one valid name."
  })
});

type SingleUserFormValues = z.infer<typeof singleUserSchema>;
type BulkUsersFormValues = z.infer<typeof bulkUsersSchema>;

export function AddUserForm() {
  const router = useRouter();

  // Single user form
  const singleForm = useForm<SingleUserFormValues>({
    resolver: zodResolver(singleUserSchema),
    defaultValues: {
      name: "",
    },
  });

  // Bulk users form
  const bulkForm = useForm<BulkUsersFormValues>({
    resolver: zodResolver(bulkUsersSchema),
    defaultValues: {
      names: "",
    },
  });

  async function onSingleSubmit(values: SingleUserFormValues) {
    try {
      const result = await addUser(values);
      
      if (result.success) {
        toast.success("User added", {
          description: `${values.name} has been added successfully.`,
        });
        singleForm.reset();
        router.refresh();
      } else {
        toast.error("Error adding user", {
          description: result.error || "There was a problem adding the user.",
        });
      }
    } catch (error: unknown) {
      console.error("Error adding user:", error);
      toast.error("Error", {
        description: "There was a problem adding the user.",
      });
    }
  }

  async function onBulkSubmit(values: BulkUsersFormValues) {
    try {
      const result = await addBulkUsers(values);
      
      if (result.success) {
        // Show success toast
        toast.success(`${result.count} users added`, {
          description: `Successfully added ${result.count} users.`,
        });
        
        // If some users failed, show a warning toast with details
        if (result.failedUsers && result.failedUsers.length > 0) {
          const failedNames = result.failedUsers.map(u => 
            `${u.name} (${u.reason})`
          ).join(', ');
          
          toast.warning(`${result.failedUsers.length} users not added`, {
            description: `The following users were not added: ${failedNames}`,
          });
        }
        
        bulkForm.reset();
        router.refresh();
      } else {
        // Show error toast
        toast.error("Error adding users", {
          description: result.error || "There was a problem adding users.",
        });
        
        // If there are details about failed users, show them
        if (result.failedUsers && result.failedUsers.length > 0) {
          const failedNames = result.failedUsers.map(u => 
            `${u.name} (${u.reason})`
          ).join(', ');
          
          toast.error("Failed users", {
            description: `Failed to add: ${failedNames}`,
          });
        }
      }
    } catch (error: unknown) {
      console.error("Error adding bulk users:", error);
      toast.error("Error", {
        description: "There was a problem adding users.",
      });
    }
  }

  return (
    <Tabs defaultValue="single">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single">Single User</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Add</TabsTrigger>
      </TabsList>
      
      <TabsContent value="single" className="pt-4">
        <Form {...singleForm}>
          <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-6">
            <FormField
              control={singleForm.control}
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
            <Button type="submit" className="w-full">
              Add User
            </Button>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="bulk" className="pt-4">
        <Form {...bulkForm}>
          <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
            <FormField
              control={bulkForm.control}
              name="names"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Names</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter one name per line"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter one name per line. Each name must be 2-100 characters long.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Add Users
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
