'use server';

import { createQuestion, updateQuestion, deleteQuestion, createQuestionOption, sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Server action to create a new question
export async function createQuestionAction(formData: {
  text: string;
  order_position: number;
  options: { text: string }[];
}) {
  try {
    // Create the question first
    const newQuestion = await createQuestion(
      formData.text,
      formData.order_position
    );

    // Then create the options if any exist
    if (formData.options && formData.options.length > 0) {
      // Create each option with its position
      await Promise.all(formData.options.map((option, index) => {
        if (option.text.trim()) {
          return createQuestionOption(
            newQuestion.id,
            option.text,
            index + 1 // Position starts at 1
          );
        }
        return Promise.resolve(); // Skip empty options
      }));
    }

    // Revalidate the questions page after creating a question
    revalidatePath('/admin/questions');
    return { success: true };
  } catch (error) {
    console.error('Error creating question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Server action to update an existing question
export async function updateQuestionAction(
  id: number,
  formData: {
    text: string;
    order_position: number;
    options: { text: string; id?: number }[];
    existingOptionIds?: number[];
  }
) {
  try {
    console.log('Updating question with ID:', id);
    console.log('Form data received:', formData);

    // Update the question first
    await updateQuestion(
      id,
      formData.text,
      formData.order_position
    );

    // Handle question options using simpler approach
    if (formData.options) {
      // Get all existing options for this question
      const existingOptions = await sql`
        SELECT id FROM question_options WHERE question_id = ${id}
      `;

      // Delete all existing options
      if (existingOptions && existingOptions.length > 0) {
        console.log('Deleting all existing options for question ID:', id);
        await sql`DELETE FROM question_options WHERE question_id = ${id}`;
      }

      // Create new options
      await Promise.all(formData.options.map(async (option, index) => {
        if (!option.text.trim()) return; // Skip empty options

        console.log('Creating new option:', option.text);
        await createQuestionOption(
          id,
          option.text,
          index + 1 // Position starts at 1
        );
      }));
    }

    // Revalidate the questions page after updating a question
    revalidatePath('/admin/questions');
    return { success: true };
  } catch (error) {
    console.error('Error updating question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Server action to delete a question
export async function deleteQuestionAction(id: number) {
  try {
    await deleteQuestion(id);

    // Force aggressive revalidation for production environment
    revalidatePath('/admin/questions', 'page');
    revalidatePath('/admin', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error deleting question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Server action to swap question positions
export async function swapQuestionPositionsAction(
  questionId1: number,
  position1: number,
  questionId2: number,
  position2: number
) {
  try {
    // Update both questions directly since there are no DB constraints
    // Update the first question's position
    await sql`
      UPDATE questions
      SET order_position = ${position2}
      WHERE id = ${questionId1}
    `;

    // Update the second question's position
    await sql`
      UPDATE questions
      SET order_position = ${position1}
      WHERE id = ${questionId2}
    `;

    // Revalidate the questions page after swapping positions
    revalidatePath('/admin/questions');
    return { success: true };
  } catch (error) {
    console.error('Error swapping question positions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Define the interface for a bulk question entry
interface BulkQuestionEntry {
  text: string;
  options: string[];
}

// Define interface for results
interface BulkCreateResult {
  success: boolean;
  questionsAdded?: number;
  failedQuestions?: { text: string, reason: string }[];
  error?: string;
}

/**
 * Parse raw text input into structured question data
 * Format expected:
 * question text
 * - option 1
 * - option 2
 * - option 3
 * 
 * next question text
 * - option a
 * - option b
 */
function parseQuestionText(text: string): BulkQuestionEntry[] {
  const questions: BulkQuestionEntry[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion: BulkQuestionEntry | null = null;
  
  for (const line of lines) {
    if (line.startsWith('-')) {
      // This is an option for the current question
      if (currentQuestion) {
        const optionText = line.substring(1).trim();
        if (optionText) {
          currentQuestion.options.push(optionText);
        }
      }
    } else {
      // This is a new question
      if (currentQuestion && currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        text: line,
        options: []
      };
    }
  }
  
  // Add the last question if it exists
  if (currentQuestion && currentQuestion.options.length > 0) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// Server action to create multiple questions at once
export async function createBulkQuestionsAction(rawText: string): Promise<BulkCreateResult> {
  try {
    // Parse the text input into structured questions
    const parsedQuestions = parseQuestionText(rawText);
    
    if (parsedQuestions.length === 0) {
      return {
        success: false,
        error: 'No valid questions found in input'
      };
    }
    
    // Get the current max order position
    const result = await sql`SELECT MAX(order_position) as max_pos FROM questions`;
    const maxPosition = result[0]?.max_pos || 0;
    let currentPosition = maxPosition + 1;
    
    // Store any questions that fail to be created
    const failedQuestions: { text: string, reason: string }[] = [];
    let successCount = 0;
    
    // Create each question
    for (const question of parsedQuestions) {
      try {
        if (question.options.length < 2) {
          failedQuestions.push({
            text: question.text,
            reason: 'Question must have at least 2 options'
          });
          continue;
        }
        
        // Create the question
        const createdQuestion = await createQuestion(
          question.text,
          currentPosition++
        );
        
        // Create options for this question
        await Promise.all(question.options.map(async (optionText, index) => {
          await createQuestionOption(
            createdQuestion.id,
            optionText,
            index + 1 // Position starts at 1
          );
        }));
        
        successCount++;
      } catch (error) {
        console.error(`Error creating question "${question.text}":`, error);
        failedQuestions.push({
          text: question.text,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Revalidate the questions page
    revalidatePath('/admin/questions');
    
    return {
      success: successCount > 0,
      questionsAdded: successCount,
      failedQuestions: failedQuestions.length > 0 ? failedQuestions : undefined
    };
  } catch (error) {
    console.error('Error creating bulk questions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
