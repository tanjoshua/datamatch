import { getUser } from "@/lib/db";
import { UserSelect } from "@/components/user-select";

export default async function Home() {
  // Fetch all users from the database
  const users = await getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">44th FC Datamatch</h1>
          <p className="text-muted-foreground">
            Select your name to start or continue the survey
          </p>
        </div>

        <div className="border rounded-lg p-6 shadow-sm bg-card">
          <UserSelect users={users} className="w-full" />

          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Please select your name from the dropdown above to begin or continue your survey.
              Your selection will be saved on the browser for future visits.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground mt-4">
            FC DataMatch © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
