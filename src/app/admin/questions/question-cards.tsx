"use client";

import { useState } from "react";
import { Question, QuestionOption } from "@/lib/db";
import { QuestionWithOptions } from "./page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import DeleteQuestionDialog from "./delete-question-dialog";
import QuestionForm from "./question-form";
import { swapQuestionPositionsAction } from "./actions";
import { toast } from "sonner";

interface QuestionCardsProps {
  questionsWithOptions: QuestionWithOptions[];
}

export default function QuestionCards({ questionsWithOptions }: QuestionCardsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeOptions, setActiveOptions] = useState<QuestionOption[]>([]);

  const handleEditClick = (question: Question, options: QuestionOption[]) => {
    setActiveQuestion(question);
    setActiveOptions(options);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (question: Question) => {
    setActiveQuestion(question);
    setDeleteDialogOpen(true);
  };

  // Handle moving a question up (swapping with the question above it)
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return; // Can't move up if it's the first question

    const currentQuestion = questionsWithOptions[index].question;
    const prevQuestion = questionsWithOptions[index - 1].question;

    try {
      const result = await swapQuestionPositionsAction(
        currentQuestion.id,
        currentQuestion.order_position,
        prevQuestion.id,
        prevQuestion.order_position
      );

      if (result.success) {
        toast.success("Question moved up");
      } else {
        toast.error("Failed to move question");
      }
    } catch (error) {
      console.error("Error moving question:", error);
      toast.error("An error occurred");
    }
  };

  // Handle moving a question down (swapping with the question below it)
  const handleMoveDown = async (index: number) => {
    if (index >= questionsWithOptions.length - 1) return; // Can't move down if it's the last question

    const currentQuestion = questionsWithOptions[index].question;
    const nextQuestion = questionsWithOptions[index + 1].question;

    try {
      const result = await swapQuestionPositionsAction(
        currentQuestion.id,
        currentQuestion.order_position,
        nextQuestion.id,
        nextQuestion.order_position
      );

      if (result.success) {
        toast.success("Question moved down");
      } else {
        toast.error("Failed to move question");
      }
    } catch (error) {
      console.error("Error moving question:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6">
        {questionsWithOptions.map(({ question, options }, index) => (
          <Card key={question.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{question.text}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0} // Disable if it's the first question
                    aria-label="Move question up"
                  >
                    <ChevronUp className={`h-4 w-4 ${index === 0 ? 'text-muted-foreground' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === questionsWithOptions.length - 1} // Disable if it's the last question
                    aria-label="Move question down"
                  >
                    <ChevronDown className={`h-4 w-4 ${index === questionsWithOptions.length - 1 ? 'text-muted-foreground' : ''}`} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleEditClick(question, options)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => handleDeleteClick(question)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>            </CardHeader>
            <CardContent>
              <h3 className="font-medium">Options:</h3>
              {options.length > 0 ? (
                <ul>
                  {options.map((option) => (
                    <li key={option.id} className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{option.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No options defined for this question yet.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      {activeQuestion && editDialogOpen && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Modify the question details and answer options
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <QuestionForm
                questionId={activeQuestion.id}
                defaultOrderPosition={activeQuestion.order_position}
                defaultValues={{
                  text: activeQuestion.text,
                  options: activeOptions.map(option => ({
                    text: option.text
                  }))
                }}
                onSuccess={() => setEditDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete dialog */}
      {activeQuestion && deleteDialogOpen && (
        <DeleteQuestionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          question={activeQuestion}
          onSuccess={() => {
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
