"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash } from "lucide-react";
import { createQuestionAction, updateQuestionAction } from "./actions";

// Define the form schema with Zod
const questionFormSchema = z.object({
  text: z.string().min(5, {
    message: "Question text must be at least 5 characters.",
  }),
  options: z.array(
    z.object({
      text: z.string().min(1, { message: "Option text is required." }),
    })
  ).min(2, {
    message: "At least 2 answer options are required.",
  }),
});

// Use this type for the form values
type QuestionFormValues = {
  text: string;
  options: { text: string }[];
};

interface QuestionFormProps {
  defaultValues?: Partial<QuestionFormValues>;
  defaultOrderPosition?: number;
  questionId?: number;
  onSuccess?: () => void;
}

export default function QuestionForm({
  defaultValues,
  defaultOrderPosition = 1, // Order position passed from parent - dynamic, with fallback
  questionId,
  onSuccess,
}: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form with default values
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: defaultValues?.text || "",
      options: defaultValues?.options || [{ text: "" }, { text: "" }],
    },
  });

  // Use useFieldArray to handle the dynamic options field
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  async function onSubmit(data: QuestionFormValues) {
    try {
      setIsSubmitting(true);

      if (questionId) {
        // For existing questions, use the defaultOrderPosition which comes from the question
        const orderPosition = defaultOrderPosition;

        // Update existing question - using existing order_position
        const result = await updateQuestionAction(questionId, {
          text: data.text,
          order_position: orderPosition,
          options: data.options
        });

        if (result.success) {
          toast.success("Question updated", {
            description: "Your question has been updated successfully."
          });
        } else {
          throw new Error(result.error || 'Failed to update question');
        }
      } else {
        // Create new question with the default order position
        const result = await createQuestionAction({
          text: data.text,
          order_position: defaultOrderPosition,
          options: data.options.filter(option => option.text.trim() !== '') // Only include non-empty options
        });

        if (result.success) {
          toast.success("Question created", {
            description: "Your new question has been created successfully."
          });
        } else {
          throw new Error(result.error || 'Failed to create question');
        }
      }

      // Execute success callback if provided, or navigate back to questions list
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/questions");
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Error", {
        description: "Failed to save the question. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter question text here..."
                  {...field}
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormDescription>
                This is the text that will be displayed to users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Removed display order field - will be handled automatically */}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Answer Options</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`options.${index}.text`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          {form.formState.errors.options?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.options.message}
            </p>
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/questions")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {questionId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{questionId ? "Update" : "Create"} Question</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
