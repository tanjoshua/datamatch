import { getUser, getQuestions, getQuestionOptions } from "@/lib/db";
import { HomeClient } from "./home-client";
import { checkMatchResultsAvailable } from "./actions";

export const dynamic = 'force-dynamic';

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

  // Check if match results are available
  const { available: matchResultsAvailable } = await checkMatchResultsAvailable();

  return <HomeClient 
    users={users} 
    questions={questionsWithOptions} 
    matchResultsAvailable={matchResultsAvailable} 
  />;
}
