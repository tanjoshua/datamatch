"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addUser } from "./actions";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(100, {
    message: "Name must not exceed 100 characters."
  })
});

type FormValues = z.infer<typeof formSchema>;

export function AddUserForm() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await addUser(values);
      toast.success("User added", {
        description: `${values.name} has been added successfully.`,
      });
      form.reset();
      router.refresh();
    } catch (error: unknown) {
      console.error("Error adding user:", error);
      toast.error("Error", {
        description: "There was a problem adding the user.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" className="w-full">
          Add User
        </Button>
      </form>
    </Form>
  );
}
