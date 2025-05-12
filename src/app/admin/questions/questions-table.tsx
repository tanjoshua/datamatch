"use client";

import { useState } from "react";
import { Question } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Trash2 } from "lucide-react";
import DeleteQuestionDialog from "./delete-question-dialog";
import EditQuestionDialog from "./edit-question-dialog";

interface QuestionsTableProps {
  questions: Question[];
}

export default function QuestionsTable({ questions }: QuestionsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell className="font-medium">{question.text}</TableCell>
              <TableCell>{question.order_position}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <EditQuestionDialog question={question} options={[]} />
                      <span className="ml-2">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(question)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {questionToDelete && (
        <DeleteQuestionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          question={questionToDelete}
          onSuccess={() => {
            setDeleteDialogOpen(false);
            // Router refresh is handled in the dialog, but we can add additional UI updates here if needed
          }}
        />
      )}
    </div>
  );
}
