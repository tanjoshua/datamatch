import { getUser, getQuestions, getQuestionOptions } from "@/lib/db";
import { HomeClient } from "./home-client";

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

  return <HomeClient users={users} questions={questionsWithOptions} />;
}
