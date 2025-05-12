"use client";

import * as React from "react";
import { User, Question, QuestionOption } from "@/lib/db";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveSurveyResponses } from "@/app/actions";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Validation schema for survey responses
const responseSchema = z.object({
  responses: z.record(z.string(), z.string()),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

// Type for previous user response
export type UserResponse = {
  question_id: number;
  selected_option_id: number;
  question_text: string;
  option_text: string;
};



// Extend Question type to include options array
export type QuestionWithOptions = Question & {
  options: QuestionOption[];
};

interface SurveyContentProps {
  users: User[];
  questions: QuestionWithOptions[];
  selectedUserId: string | null;
  previousResponses: UserResponse[];
  loadingResponses: boolean;
  onResponsesUpdate?: (responses: UserResponse[]) => void;
}

export function SurveyContent({ users, questions, selectedUserId, previousResponses, loadingResponses, onResponsesUpdate }: SurveyContentProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // Initialize the form with React Hook Form
  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responses: {},
    },
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (selectedUserId) {
      form.reset();
      setSubmitSuccess(false);
    }
  }, [selectedUserId, form]);

  // Set loading state based on loadingResponses
  React.useEffect(() => {
    setIsLoading(loadingResponses);
  }, [loadingResponses]);

  // Handle form submission
  const onSubmit = async (values: ResponseFormValues) => {
    if (!selectedUserId) return;

    setIsSubmitting(true);

    try {
      // Format the data for the server action
      const responses = Object.entries(values.responses).map(([questionId, optionId]) => ({
        questionId: parseInt(questionId),
        selectedOptionId: parseInt(optionId),
      }));

      // Check if all questions have been answered
      if (responses.length < questions.length) {
        toast.error("Please answer all questions before submitting.");
        setIsSubmitting(false);
        return;
      }

      // Call the server action to save responses
      const result = await saveSurveyResponses({
        userId: parseInt(selectedUserId),
        responses,
      });

      if (result.success) {
        setSubmitSuccess(true);
        toast.success("Survey submitted successfully!");

        // Convert the submitted form data to UserResponse format
        if (onResponsesUpdate) {
          const userResponses: UserResponse[] = responses.map(response => {
            // Find the question and option text from the questions array
            const question = questions.find(q => q.id === response.questionId);
            const option = question?.options.find(o => o.id === response.selectedOptionId);

            return {
              question_id: response.questionId,
              selected_option_id: response.selectedOptionId,
              question_text: question?.text || '',
              option_text: option?.text || ''
            };
          });

          onResponsesUpdate(userResponses);
        }
      } else {
        toast.error(result.error || "Failed to submit survey. Please try again.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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



          {/* Display completed survey message after submission or if previously completed */}
          {(submitSuccess || previousResponses.length > 0) && (
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Survey Completed</AlertTitle>
              <AlertDescription className="text-blue-700">
                You have completed the survey. Your responses are shown below in read-only mode.
                The results will be available once all participants have completed the survey.
              </AlertDescription>
            </Alert>
          )}



          {/* Loading indicator when fetching responses */}
          {loadingResponses && (
            <div className="space-y-4 my-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-center text-muted-foreground">Checking for any previous responses...</p>
            </div>
          )
          }

          {/* Read-only view for completed surveys */}

          {!loadingResponses && ((previousResponses.length > 0 || submitSuccess) ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Your Survey Responses</h2>
              <p className="text-center text-muted-foreground">
                You have already completed this survey. Results will be available once all participants have finished.
              </p>

              {questions.map((question) => {
                // Find the user's response for this question
                const response = previousResponses.find(r => r.question_id === question.id);

                return (
                  <Card key={question.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Question {question.order_position}</CardTitle>
                      <CardDescription>{question.text}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {response ? (
                          <div className="flex items-start space-x-2 pb-2 rounded-md bg-muted/50 p-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-1" />
                            <div>
                              <div className="font-medium">Your answer:</div>
                              <div className="text-sm text-muted-foreground">{response.option_text}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground italic">No response recorded</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Survey form - only show if user hasn't completed survey yet */
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <RadioGroup
                          onValueChange={(value) => {
                            form.setValue(`responses.${question.id}`, value);
                          }}
                          value={form.watch(`responses.${question.id}`) || ""}
                        >
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

              {/* Submit button at bottom of form */}
              {questions.length > 0 && !submitSuccess && (
                <CardFooter className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || submitSuccess}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : "Submit Survey"}
                  </Button>
                </CardFooter>
              )}
            </form>
          ))}
        </>
      ) : (
        <div className="border rounded-lg p-6 shadow-sm bg-card">
          <div className="text-center space-y-4 mb-6">
            <h2 className="text-2xl font-semibold">Welcome to 44th FC Datamatch</h2>
            <p className="text-muted-foreground">
              Select your name to start or continue the survey
            </p>
          </div>

          {/* User selection is now handled in the parent component */}
          <div className="w-full text-center">
            <p className="text-sm text-muted-foreground">Please use the user selection above</p>
          </div>

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
