// No card components needed with the new layout
import { getQuestions, getQuestionOptions, Question, QuestionOption } from "@/lib/db";
import QuestionCards from "./question-cards";
import AddQuestionDialog from "./add-question-dialog";

// Disable caching for this page to ensure fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type QuestionWithOptions = {
  question: Question;
  options: QuestionOption[];
};

export default async function QuestionsPage() {
  // Get all questions
  const questions = await getQuestions();

  // Fetch options for each question
  const questionsWithOptions: QuestionWithOptions[] = await Promise.all(
    questions.map(async (question) => {
      const options = await getQuestionOptions(question.id);
      return {
        question,
        options
      };
    })
  );

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header section with title and add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Survey Questions</h1>
        </div>
        <AddQuestionDialog defaultOrderPosition={questions.length > 0 ? Math.max(...questions.map(q => q.order_position)) + 1 : 1} />
      </div>

      {/* Empty state */}
      {questions.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center bg-background">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No questions added</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t added any questions yet. Add one to get started.
            </p>
            <AddQuestionDialog defaultOrderPosition={questions.length > 0 ? Math.max(...questions.map(q => q.order_position)) + 1 : 1} />
          </div>
        </div>
      ) : (
        /* Questions list section */
        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
          <p className="text-muted-foreground">Create and manage multiple choice questions for your survey</p>
          <div className="mt-6">
            <QuestionCards questionsWithOptions={questionsWithOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
