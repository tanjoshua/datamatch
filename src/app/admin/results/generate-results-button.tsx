"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateMatchResults } from "@/app/actions";
import { toast } from "sonner";

interface GenerateResultsButtonProps {
  hasResults: boolean;
}

export function GenerateResultsButton({ hasResults }: GenerateResultsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateResults = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMatchResults();
      
      if (result.success) {
        toast.success(result.message || "Match results generated successfully");
        // Refresh the page to show the new results
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to generate results");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateResults}
      disabled={isGenerating}
      className="bg-primary"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <BarChart3 className="mr-2 h-4 w-4" />
          {hasResults ? "Regenerate Results" : "Generate Results"}
        </>
      )}
    </Button>
  );
}
