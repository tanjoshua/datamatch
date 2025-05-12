"use client";

import { useState } from "react";
import { Question } from "@/lib/db";
import { QuestionWithOptions } from "./page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import DeleteQuestionDialog from "./delete-question-dialog";
import EditQuestionDialog from "./edit-question-dialog";

interface QuestionCardsProps {
  questionsWithOptions: QuestionWithOptions[];
}

export default function QuestionCards({ questionsWithOptions }: QuestionCardsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6">
        {questionsWithOptions.map(({ question, options }) => (
          <Card key={question.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{question.text}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <EditQuestionDialog question={question} options={options} />
                      <span className="ml-2">Edit</span>
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
              <CardDescription>
                <Badge variant="outline" className="mr-2">
                  Position: {question.order_position}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h3 className="font-medium mb-2">Options:</h3>
              {options.length > 0 ? (
                <ul className="space-y-2">
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
            <CardFooter className="flex justify-end border-t pt-4">
              <p className="text-xs text-muted-foreground">
                ID: {question.id}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {questionToDelete && (
        <DeleteQuestionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          question={questionToDelete}
          onSuccess={() => {
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
