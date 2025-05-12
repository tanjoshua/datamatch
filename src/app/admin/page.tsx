import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/db";

export default async function AdminDashboard() {
  const users = await getUser();
  const completedSurveys = users.filter(user => user.has_completed_survey).length;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your DataMatch survey system
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total number of registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSurveys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users who have completed the survey
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length ? Math.round((completedSurveys / users.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of users who completed the survey
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Survey Status</CardTitle>
            <CardDescription>Overview of survey completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[10px] w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${users.length ? Math.round((completedSurveys / users.length) * 100) : 0}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {completedSurveys} out of {users.length} users have completed the survey
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
