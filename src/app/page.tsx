import { getUser, getQuestions, getQuestionOptions } from "@/lib/db";
import { SurveyContent } from "@/components/survey-content";

export default async function Home() {
  // Fetch all users from the database
  const users = await getUser();

  // Fetch all questions from the database
  const questions = await getQuestions();

  // Fetch options for each question
  const questionsWithOptions = await Promise.all(
    questions.map(async (question) => {
      const options = await getQuestionOptions(question.id);
      return { ...question, options };
    })
  );

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">44th FC Datamatch</h1>
        </div>

        <SurveyContent
          users={users}
          questions={questionsWithOptions}
        />

        <div className="text-center">
          <p className="text-xs text-muted-foreground mt-4">
            FC DataMatch © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
