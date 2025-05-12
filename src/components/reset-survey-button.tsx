"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resetSurveyAndResults } from "@/app/actions";
import { toast } from "sonner";

export function ResetSurveyButton() {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const handleReset = async () => {
    setIsLoading(true);
    try {
      const result = await resetSurveyAndResults();
      if (result.success) {
        toast.success("Reset Successful", {
          description: result.message,
        });
      } else {
        toast.error("Reset Failed", {
          description: result.error || "An error occurred while resetting data.",
        });
      }
    } catch {
      toast.error("Reset Failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsAlertOpen(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Reset Survey Data
      </Button>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete all survey responses and match results. All users will be marked
              as not having completed the survey. Questions will be preserved, but all other data will be permanently removed.
            </AlertDialogDescription>
            <div className="p-3 mt-3 border rounded-md border-destructive/30 bg-destructive/10 text-sm">
              <strong>Warning:</strong> This action cannot be undone.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Resetting..." : "Yes, Reset Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
