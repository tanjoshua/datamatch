"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import QuestionForm from "./question-form";
import { Question, QuestionOption } from "@/lib/db";

interface EditQuestionDialogProps {
  question: Question;
  options: QuestionOption[];
}

export default function EditQuestionDialog({ question, options }: EditQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setOpen(true)}>
        <span className="sr-only">Edit question</span>
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Modify the question details and answer options
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <QuestionForm
            questionId={question.id}
            defaultOrderPosition={question.order_position}
            defaultValues={{
              text: question.text,
              options: options.map(option => ({ 
                text: option.text 
              }))
            }}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
