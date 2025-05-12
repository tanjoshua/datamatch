"use client";

import * as React from "react";
import { UserSelect } from "@/components/user-select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { UserCircle } from "lucide-react";
import { getUserResponses } from "./actions";
import { SurveyContent } from "@/components/survey-content";
import { MatchResults } from "@/components/match-results";
import { User } from "@/lib/db";
import { QuestionWithOptions, UserResponse } from "@/components/survey-content";

interface HomeClientProps {
  users: User[];
  questions: QuestionWithOptions[];
  matchResultsAvailable: boolean;
}

export function HomeClient({ users, questions, matchResultsAvailable }: HomeClientProps) {
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [previousResponses, setPreviousResponses] = React.useState<UserResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = React.useState(false);

  // Load selected user from localStorage on component mount
  React.useEffect(() => {
    const savedUserId = localStorage.getItem("selectedUserId");
    if (savedUserId) {
      setSelectedUserId(savedUserId);
      checkUserResponses(parseInt(savedUserId));
    }
  }, []);

  // Check for previous user responses
  const checkUserResponses = async (userId: number) => {
    setLoadingResponses(true);
    try {
      const result = await getUserResponses(userId);
      if (result.success && result.data && result.data.length > 0) {
        setPreviousResponses(result.data as UserResponse[]);
      } else {
        setPreviousResponses([]);
      }
    } catch (err) {
      console.error("Error checking user responses:", err);
      setPreviousResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Function to handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    localStorage.setItem("selectedUserId", userId);
    // Check if user has already completed the survey
    checkUserResponses(parseInt(userId));
  };

  // Function to clear user selection
  const clearUserSelection = () => {
    setSelectedUserId(null);
    localStorage.removeItem("selectedUserId");
    setPreviousResponses([]);
  };

  // Check if user has selected their name
  const selectedUser = selectedUserId
    ? users.find(user => user.id.toString() === selectedUserId)
    : null;

  return (
    <div className="min-h-screen flex flex-col p-4" style={{ backgroundColor: "#ffccdc" }}>
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {!selectedUser ? (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h1 className="text-2xl font-bold text-center">FC DataMatch</h1>
            <p className="text-center">Please select your name to begin the survey</p>
            <UserSelect
              users={users}
              className="w-full max-w-xs mx-auto"
              onUserSelect={handleUserSelect}
            />
          </div>
        ) : (
          <>
            <Alert className="bg-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <AlertTitle className="font-medium">You are responding as {selectedUser.name}</AlertTitle>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">Not you?</div>
                <div className="w-48">
                  <UserSelect
                    users={users}
                    className="w-full"
                    selectedUserId={selectedUserId || undefined}
                    onUserSelect={handleUserSelect}
                  />
                </div>
                <button
                  onClick={clearUserSelection}
                  className="text-sm text-primary hover:text-primary/80 hover:underline"
                >
                  Clear selection
                </button>
              </div>
            </Alert>
            {matchResultsAvailable ? (
              <MatchResults selectedUserId={selectedUserId} />
            ) : (
              <SurveyContent
                users={users}
                questions={questions}
                selectedUserId={selectedUserId}
                previousResponses={previousResponses}
                loadingResponses={loadingResponses}
              />
            )}
          </>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground mt-4">
            FC DataMatch © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
