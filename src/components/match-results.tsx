"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Lightbulb } from "lucide-react";
import { getMatchResults } from "@/app/actions";
import { MatchComparisonContent } from "@/components/match-comparison-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface MatchResultEntry {
  other_user_id: number;
  name: string;
  match_percentage: number;
}

interface MatchResultsProps {
  selectedUserId: string | null;
}

export function MatchResults({ selectedUserId }: MatchResultsProps) {
  const [loading, setLoading] = React.useState(true);
  const [matchResults, setMatchResults] = React.useState<{
    mostSimilar: MatchResultEntry[];
    mostDifferent: MatchResultEntry[];
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = React.useState<MatchResultEntry | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openComparisonDialog = (match: MatchResultEntry) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  React.useEffect(() => {
    const fetchResults = async () => {
      if (!selectedUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await getMatchResults(parseInt(selectedUserId));
        if (results.success) {
          setMatchResults({
            mostSimilar: results.mostSimilar as MatchResultEntry[],
            mostDifferent: results.mostDifferent as MatchResultEntry[],
          });
          setError(null);
        } else {
          setError(results.error || "Failed to fetch match results");
          setMatchResults(null);
        }
      } catch (err) {
        console.error("Error fetching match results:", err);
        setError("An unexpected error occurred");
        setMatchResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedUserId]);

  // Helper function to get color based on match percentage
  const getPercentageColor = (percentage: number, isSimliar: boolean) => {
    if (isSimliar) {
      if (percentage >= 80) return "bg-green-100 text-green-800 border-green-300";
      if (percentage >= 60) return "bg-lime-100 text-lime-800 border-lime-300";
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else {
      if (percentage <= 20) return "bg-red-100 text-red-800 border-red-300";
      if (percentage <= 40) return "bg-orange-100 text-orange-800 border-orange-300";
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading your match results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Results</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!matchResults || (matchResults.mostSimilar.length === 0 && matchResults.mostDifferent.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50 text-center">
          <h3 className="text-xl font-medium mb-3">No Match Results Available</h3>

          <div className="space-y-4 ">
            <div className="flex items-start">
              <div>
                <p className="font-medium">Have you completed the survey?</p>
                <p className="text-sm text-yellow-800">
                  You need to complete the full survey to get match results.
                  If you&apos;ve already completed the survey, please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Your DataMatch Results!</h2>
        <p className="text-muted-foreground">
          Based on your survey answers, here are the people most like you and least like you.
        </p>
      </div>

      <Alert className="bg-pink-50 border-pink-200">
        <Lightbulb className="h-4 w-4 text-pink-500" />
        <AlertDescription className="text-sm">
          <p className="font-medium text-pink-900 mb-2">To facilitate speed bonding, consider the following activities with your matches:</p>
          <ul className="space-y-1 text-pink-800">
            <li><strong>Most similar</strong> - stare awkwardly at each other across the room and never speak; choose each other&apos;s birdsona; take MC together.</li>
            <li><strong>Least similar</strong> - rat each other&apos;s messages out to Faizad; 1v1 brawl in the CSC lobby; run against each other in GE2030.</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Similar Matches */}
        <Card>
          <CardHeader className="">
            <CardTitle className="text-xl">Most Similar</CardTitle>
            <CardDescription>People who answered most like you</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {matchResults.mostSimilar.map((match) => (
                <li
                  key={match.other_user_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-muted cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openComparisonDialog(match)}
                >
                  <span className="font-medium">{match.name}</span>
                  <div className="flex items-center">
                    <Badge className={`${getPercentageColor(match.match_percentage, true)}`}>
                      {Math.round(match.match_percentage)}% Match
                    </Badge>
                    <Info className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Most Different Matches */}
        <Card>
          <CardHeader className="">
            <CardTitle className="text-xl">Most Different</CardTitle>
            <CardDescription>People who answered least like you</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {matchResults.mostDifferent.map((match) => (
                <li
                  key={match.other_user_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-muted cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openComparisonDialog(match)}
                >
                  <span className="font-medium">{match.name}</span>
                  <div className="flex items-center">
                    <Badge className={`${getPercentageColor(match.match_percentage, false)}`}>
                      {Math.round(match.match_percentage)}% Match
                    </Badge>
                    <Info className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Dialog */}
      {selectedMatch && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>Match Comparison</span>
                <Badge className={getPercentageColor(selectedMatch.match_percentage, selectedMatch.match_percentage >= 50)}>
                  {Math.round(selectedMatch.match_percentage)}% Match
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Question-by-question comparison between you and {selectedMatch.name}
              </DialogDescription>
            </DialogHeader>

            <MatchComparisonContent
              userId1={parseInt(selectedUserId!)}
              userId2={selectedMatch.other_user_id}
              user1Name="You"
              user2Name={selectedMatch.name}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
