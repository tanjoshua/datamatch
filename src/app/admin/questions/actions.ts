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

    // Revalidate the questions page after deleting a question
    revalidatePath('/admin/questions');
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
