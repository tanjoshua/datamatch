"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { getMatchComparison } from "@/app/actions";

export interface MatchComparison {
  question_id: number;
  question_text: string;
  user1_option_text: string;
  user2_option_text: string;
  is_same: boolean;
}

type ComparisonResult = {
  success: boolean;
  data?: MatchComparison[];
  error?: string;
};

interface MatchComparisonDialogProps {
  user1Name: string;
  user2Name: string;
  matchPercentage: number;
  children: React.ReactNode;
  userId1: number;
  userId2: number;
}

export function MatchComparisonDialog({
  user1Name,
  user2Name,
  matchPercentage,
  children,
  userId1,
  userId2
}: MatchComparisonDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [comparisons, setComparisons] = React.useState<MatchComparison[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch the comparison data when the dialog opens
  const fetchComparisonData = React.useCallback(async () => {
    if (!userId1 || !userId2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getMatchComparison(userId1, userId2) as ComparisonResult;
      
      if (result.success && result.data) {
        setComparisons(result.data);
      } else {
        setError(result.error || "Failed to fetch comparison data");
      }
    } catch (err) {
      console.error("Error fetching comparison data:", err);
      setError("Failed to load question comparisons");
    } finally {
      setLoading(false);
    }
  }, [userId1, userId2]);

  React.useEffect(() => {
    if (isOpen) {
      fetchComparisonData();
    }
  }, [isOpen, fetchComparisonData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <div className="contents">{children}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Match Comparison</span>
            <Badge className={getMatchColor(matchPercentage)}>
              {Math.round(matchPercentage)}% Match
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Question-by-question comparison between {user1Name} and {user2Name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Loading comparisons...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {comparisons.length === 0 ? (
              <div className="text-center text-muted-foreground">No comparison data available</div>
            ) : (
              comparisons.map((comparison) => (
                <div key={comparison.question_id} className="rounded-lg border p-4">
                  <div className="font-medium mb-3">{comparison.question_text}</div>
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                    <div className="p-3 bg-slate-50 rounded">
                      <div className="text-sm font-medium mb-1">{user1Name}</div>
                      <div>{comparison.user1_option_text}</div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {comparison.is_same ? (
                        <div className="rounded-full bg-green-100 p-1">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-red-100 p-1">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded">
                      <div className="text-sm font-medium mb-1">{user2Name}</div>
                      <div>{comparison.user2_option_text}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to determine badge color based on match percentage
function getMatchColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100";
  if (percentage >= 60) return "bg-lime-100 text-lime-800 border-lime-300 hover:bg-lime-100";
  if (percentage >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100";
  if (percentage >= 20) return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100";
  return "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
}
