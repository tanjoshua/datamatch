import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon client
neonConfig.fetchConnectionCache = true;

// Create a SQL client
export const sql = neon(process.env.DATABASE_URL!);

// Define User type based on schema.sql
export type User = {
  id: number;
  name: string;
  has_completed_survey: boolean;
  created_at: string;
};

// Define Question type based on schema.sql
export type Question = {
  id: number;
  text: string;
  order_position: number;
  created_at: string;
  updated_at: string;
};

// Define QuestionOption type based on schema.sql
export type QuestionOption = {
  id: number;
  question_id: number;
  text: string;
  order_position: number;
  created_at: string;
  updated_at: string;
};

// User functions
export async function getUser() {
  const response = await sql`SELECT * FROM users ORDER BY name ASC`;
  return response as User[];
}

// Question functions
export async function getQuestions() {
  const response = await sql`
    SELECT * FROM questions 
    ORDER BY order_position ASC
  `;
  return response as Question[];
}

export async function getQuestion(id: number) {
  const [question] = await sql`
    SELECT * FROM questions 
    WHERE id = ${id}
  `;
  return question as Question;
}

export async function createQuestion(
  text: string,
  order_position: number
) {
  const [question] = await sql`
    INSERT INTO questions (text, order_position)
    VALUES (${text}, ${order_position})
    RETURNING *
  `;
  return question as Question;
}

export async function updateQuestion(
  id: number,
  text: string,
  order_position: number
) {
  const [question] = await sql`
    UPDATE questions
    SET 
      text = ${text},
      order_position = ${order_position},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return question as Question;
}

export async function deleteQuestion(id: number) {
  await sql`DELETE FROM questions WHERE id = ${id}`;
}

// Question Option functions
export async function getQuestionOptions(questionId: number) {
  const options = await sql`
    SELECT * FROM question_options
    WHERE question_id = ${questionId}
    ORDER BY order_position ASC
  `;
  return options as QuestionOption[];
}

export async function createQuestionOption(
  questionId: number,
  text: string,
  orderPosition: number
) {
  const [option] = await sql`
    INSERT INTO question_options (question_id, text, order_position)
    VALUES (${questionId}, ${text}, ${orderPosition})
    RETURNING *
  `;
  return option as QuestionOption;
}

export async function updateQuestionOption(
  id: number,
  text: string,
  orderPosition: number
) {
  const [option] = await sql`
    UPDATE question_options
    SET 
      text = ${text},
      order_position = ${orderPosition},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return option as QuestionOption;
}

export async function deleteQuestionOption(id: number) {
  await sql`DELETE FROM question_options WHERE id = ${id}`;
}
