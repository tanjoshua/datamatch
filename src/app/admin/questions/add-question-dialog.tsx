"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import QuestionForm from "./question-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createBulkQuestionsAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddQuestionDialogProps {
  defaultOrderPosition: number;
}

// Define the bulk form schema with Zod
const bulkFormSchema = z.object({
  questions: z.string().min(10, {
    message: "Please enter at least one question with options.",
  }),
});

type BulkFormValues = z.infer<typeof bulkFormSchema>;

export default function AddQuestionDialog({ defaultOrderPosition }: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form
  const bulkForm = useForm<BulkFormValues>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      questions: "",
    },
  });

  async function onBulkSubmit(values: BulkFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createBulkQuestionsAction(values.questions);

      if (result.success) {
        toast.success("Questions added", {
          description: `Successfully added ${result.questionsAdded} question(s)`,
        });
        router.refresh();
        setOpen(false);
        bulkForm.reset();
      } else {
        toast.error("Error adding questions", {
          description: result.error || "Failed to add questions",
        });

        if (result.failedQuestions && result.failedQuestions.length > 0) {
          const failedTexts = result.failedQuestions.map(q =>
            `${q.text.substring(0, 20)}... (${q.reason})`
          ).join('\n');

          toast.error("Some questions couldn't be added", {
            description: failedTexts,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting bulk questions:", error);
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new survey question with multiple choice options
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Tabs defaultValue="single">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Question</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Add</TabsTrigger>
            </TabsList>

            {/* Single question form */}
            <TabsContent value="single" className="pt-4">
              <QuestionForm
                defaultOrderPosition={defaultOrderPosition}
                onSuccess={() => setOpen(false)}
              />
            </TabsContent>

            {/* Bulk add form */}
            <TabsContent value="bulk" className="pt-4">
              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                  <FormField
                    control={bulkForm.control}
                    name="questions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bulk Questions</FormLabel>
                        <div className="mb-2 rounded-md bg-muted p-3 text-sm">
                          <p className="font-medium mb-1">Format Instructions:</p>
                          <p className="mb-2">Type each question on its own line, followed by options starting with a dash (-)</p>
                          <div className="bg-background p-2 rounded text-xs font-mono">
                            What is your preferred learning style?<br />
                            - Visual (diagrams, charts, videos)<br />
                            - Auditory (lectures, discussions)<br />
                            - Reading/writing (textbooks, notes)<br />
                            <br />
                            How often do you study outside of class?<br />
                            - Daily, consistent schedule<br />
                            - Only before exams<br />
                            - Weekends only
                          </div>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your questions and options here..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Questions"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
