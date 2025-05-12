
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { sql } from "@/lib/db";
import { StatsCard } from "./stats-card";
import { GenerateResultsButton } from "./generate-results-button";
import { MatchResultsTable, type MatchResult } from "@/components/match-results-table";
import { ResetSurveyButton } from "@/components/reset-survey-button";

export const dynamic = 'force-dynamic';

// Get match statistics from database
async function getMatchStatistics() {
  try {
    // Check if there are any match results
    const matchCount = await sql`SELECT COUNT(*) as count FROM match_results`;
    const totalMatches = parseInt(matchCount[0].count);

    if (totalMatches === 0) {
      return {
        hasResults: false,
        totalMatches: 0,
        userCount: 0,
        highestMatch: null,
        lowestMatch: null,
        allMatches: []
      };
    }

    // Get count of users who completed the survey
    const userCount = await sql`
      SELECT COUNT(*) as count FROM users WHERE has_completed_survey = TRUE
    `;

    // Get highest match
    const highestMatch = await sql`
      SELECT 
        mr.user_id_1, 
        mr.user_id_2, 
        mr.match_percentage,
        u1.name as user1_name,
        u2.name as user2_name
      FROM match_results mr
      JOIN users u1 ON mr.user_id_1 = u1.id
      JOIN users u2 ON mr.user_id_2 = u2.id
      ORDER BY mr.match_percentage DESC
      LIMIT 1
    `;

    // Get lowest match
    const lowestMatch = await sql`
      SELECT 
        mr.user_id_1, 
        mr.user_id_2, 
        mr.match_percentage,
        u1.name as user1_name,
        u2.name as user2_name
      FROM match_results mr
      JOIN users u1 ON mr.user_id_1 = u1.id
      JOIN users u2 ON mr.user_id_2 = u2.id
      ORDER BY mr.match_percentage ASC
      LIMIT 1
    `;

    // Get all matches sorted by percentage (highest to lowest)
    const allMatches = await sql`
      SELECT 
        mr.user_id_1, 
        mr.user_id_2, 
        mr.match_percentage,
        mr.common_answers,
        mr.total_possible,
        u1.name as user1_name,
        u2.name as user2_name
      FROM match_results mr
      JOIN users u1 ON mr.user_id_1 = u1.id
      JOIN users u2 ON mr.user_id_2 = u2.id
      ORDER BY mr.match_percentage DESC
    `;

    return {
      hasResults: true,
      totalMatches,
      userCount: parseInt(userCount[0].count),
      highestMatch: highestMatch[0],
      lowestMatch: lowestMatch[0],
      allMatches
    };
  } catch (error) {
    console.error("Error getting match statistics:", error);
    return {
      hasResults: false,
      error: "Failed to fetch match statistics."
    };
  }
}

export default async function ResultsPage() {
  // Get match statistics
  const stats = await getMatchStatistics();

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header section with title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
          <p className="text-muted-foreground">
            Process and view survey match results
          </p>
        </div>
        <div className="flex gap-3">
          <ResetSurveyButton />
          <GenerateResultsButton hasResults={stats.hasResults} />
        </div>
      </div>

      {stats.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{stats.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Matches"
          value={stats.totalMatches}
          description="Total user pairs with match data"
        />
        <StatsCard
          title="Surveyed Users"
          value={stats.userCount}
          description="Users who completed the survey"
        />
        <StatsCard
          title="Highest Match"
          value={stats.highestMatch ? `${Math.round(stats.highestMatch.match_percentage)}%` : "N/A"}
          description={stats.highestMatch ?
            `${stats.highestMatch.user1_name} & ${stats.highestMatch.user2_name}` :
            "No matches generated yet"}
        />
        <StatsCard
          title="Lowest Match"
          value={stats.lowestMatch ? `${Math.round(stats.lowestMatch.match_percentage)}%` : "N/A"}
          description={stats.lowestMatch ?
            `${stats.lowestMatch.user1_name} & ${stats.lowestMatch.user2_name}` :
            "No matches generated yet"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
          <CardDescription>
            {stats.hasResults
              ? `Matching data has been generated for ${stats.userCount} users and ${stats.totalMatches} pairs`
              : "No match results generated yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          {!stats.hasResults ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">No Match Results Available</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-4">
                Generate match results using the button above once survey responses have been collected.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div>
                  <h3 className="font-medium">Matches Generated Successfully</h3>
                  <p className="text-sm text-muted-foreground">
                    Match results have been calculated and stored in the database.
                  </p>
                </div>
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                </Badge>
              </div>

              {/* All Matches Table */}
              <div className="mt-6">
                <MatchResultsTable matchResults={(stats.allMatches || []) as MatchResult[]} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
