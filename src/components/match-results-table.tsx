"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MatchComparisonContent } from "@/components/match-comparison-content";

export type MatchResult = {
  user_id_1: number;
  user_id_2: number;
  user1_name: string;
  user2_name: string;
  match_percentage: number;
  common_answers: number;
  total_possible: number;
};

interface MatchResultsTableProps {
  matchResults: MatchResult[];
}

export function MatchResultsTable({ matchResults }: MatchResultsTableProps) {
  const [selectedMatch, setSelectedMatch] = React.useState<MatchResult | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const handleRowClick = (match: MatchResult) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };
  
  // Helper function to determine badge color based on match percentage
  function getMatchColor(percentage: number): string {
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-300 hover:bg-green-100";
    if (percentage >= 60) return "bg-lime-100 text-lime-800 border-lime-300 hover:bg-lime-100";
    if (percentage >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100";
    if (percentage >= 20) return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100";
    return "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User 1</TableHead>
            <TableHead>User 2</TableHead>
            <TableHead>Match %</TableHead>
            <TableHead>Common Answers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchResults?.map((match, index) => (
            <TableRow 
              key={index} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleRowClick(match)}
            >
              <TableCell>{match.user1_name}</TableCell>
              <TableCell>{match.user2_name}</TableCell>
              <TableCell>
                <Badge className={`${getMatchColor(match.match_percentage)}`}>
                  {Math.round(match.match_percentage)}%
                </Badge>
              </TableCell>
              <TableCell className="flex items-center justify-between">
                <span>{match.common_answers} / {match.total_possible}</span>
                <Info className="h-4 w-4 text-muted-foreground ml-2" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedMatch && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>Match Comparison</span>
                <Badge className={getMatchColor(selectedMatch.match_percentage)}>
                  {Math.round(selectedMatch.match_percentage)}% Match
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Question-by-question comparison between {selectedMatch.user1_name} and {selectedMatch.user2_name}
              </DialogDescription>
            </DialogHeader>
            
            <MatchComparisonContent 
              userId1={selectedMatch.user_id_1} 
              userId2={selectedMatch.user_id_2} 
              user1Name={selectedMatch.user1_name}
              user2Name={selectedMatch.user2_name}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
