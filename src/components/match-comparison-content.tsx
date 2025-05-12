"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { getMatchComparison } from "@/app/actions";

export type ComparisonItem = {
  question_id: number;
  question_text: string;
  user1_option_text: string;
  user2_option_text: string;
  is_same: boolean;
};

interface MatchComparisonContentProps {
  userId1: number;
  userId2: number;
  user1Name: string;
  user2Name: string;
}

export function MatchComparisonContent({ 
  userId1, 
  userId2, 
  user1Name, 
  user2Name 
}: MatchComparisonContentProps) {
  const [loading, setLoading] = React.useState(true);
  const [comparisons, setComparisons] = React.useState<ComparisonItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getMatchComparison(userId1, userId2);
        
        if (result.success && result.data) {
          setComparisons(result.data as ComparisonItem[]);
        } else {
          setError(result.error || "Failed to fetch comparison data");
        }
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError("Failed to load question comparisons");
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [userId1, userId2]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <span className="ml-3 text-muted-foreground">Loading comparisons...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-center">
        {error}
      </div>
    );
  }
  
  if (comparisons.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No comparison data available</div>
    );
  }
  
  return (
    <div className="space-y-4 pt-4">
      {comparisons.map((comparison) => (
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
      ))}
    </div>
  );
}
