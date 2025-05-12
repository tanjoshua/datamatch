
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";


export default function ResultsPage() {
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
        <Button disabled className="bg-primary">
          <BarChart3 className="mr-2 h-4 w-4" />
          Generate Results
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="border border-dashed rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Results Management Coming Soon</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              This page will allow you to generate and manage match results once the survey responses have been collected.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
