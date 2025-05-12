"use client";

import * as React from "react";
import { User, Question, QuestionOption } from "@/lib/db";
import { UserSelect } from "@/components/user-select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle } from "lucide-react";

// Extend Question type to include options array
type QuestionWithOptions = Question & {
  options: QuestionOption[];
};

interface SurveyContentProps {
  users: User[];
  questions: QuestionWithOptions[];
}

export function SurveyContent({ users, questions }: SurveyContentProps) {
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load selected user from localStorage on component mount
  React.useEffect(() => {
    const savedUserId = localStorage.getItem("selectedUserId");
    if (savedUserId) {
      setSelectedUserId(savedUserId);
    }
    setIsLoading(false);
  }, []);

  // Function to handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    localStorage.setItem("selectedUserId", userId);
  };

  // Function to clear user selection
  const clearUserSelection = () => {
    setSelectedUserId(null);
    localStorage.removeItem("selectedUserId");
  };

  // Check if user has selected their name
  const selectedUser = selectedUserId
    ? users.find(user => user.id.toString() === selectedUserId)
    : null;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="border rounded-lg p-6 shadow-sm bg-card space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : selectedUser ? (
        <>
          {/* User selection alert at top */}
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

          {/* Survey questions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">Survey Questions</h2>
            <p className="text-center text-muted-foreground">
              Answer all questions to be matched with like-minded individuals
            </p>

            {questions.length > 0 ? (
              questions.map((question) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Question {question.order_position}</CardTitle>
                    <CardDescription>{question.text}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup defaultValue="">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2 pb-2">
                          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                          <Label
                            htmlFor={`option-${option.id}`}
                            className="font-normal text-sm leading-relaxed cursor-pointer"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No questions have been added to the survey yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <div className="border rounded-lg p-6 shadow-sm bg-card">
          <div className="text-center space-y-4 mb-6">
            <h2 className="text-2xl font-semibold">Welcome to 44th FC Datamatch</h2>
            <p className="text-muted-foreground">
              Select your name to start or continue the survey
            </p>
          </div>

          <UserSelect
            users={users}
            className="w-full"
            selectedUserId={selectedUserId || undefined}
            onUserSelect={handleUserSelect}
          />

          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Please select your name from the dropdown above to begin or continue your survey.
              Your selection will be saved on the browser for future visits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
