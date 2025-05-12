"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Get a user's existing survey responses
 */
export async function getUserResponses(userId: number) {
  try {
    const responses = await sql`
      SELECT 
        sr.question_id,
        sr.selected_option_id,
        q.text as question_text,
        qo.text as option_text
      FROM 
        survey_responses sr
      JOIN 
        questions q ON sr.question_id = q.id
      JOIN 
        question_options qo ON sr.selected_option_id = qo.id
      WHERE 
        sr.user_id = ${userId}
      ORDER BY 
        q.order_position ASC
    `;
    
    return { success: true, data: responses };
  } catch (error) {
    console.error("Error fetching user responses:", error);
    return { success: false, error: "Failed to fetch your responses." };
  }
}

// Validation schema for survey responses
const surveyResponseSchema = z.object({
  userId: z.coerce.number(),
  responses: z.array(
    z.object({
      questionId: z.coerce.number(),
      selectedOptionId: z.coerce.number(),
    })
  ),
});

type SurveyResponseInput = z.infer<typeof surveyResponseSchema>;

/**
 * Server action to save survey responses
 */
export async function saveSurveyResponses(formData: SurveyResponseInput) {
  // Validate input
  const result = surveyResponseSchema.safeParse(formData);

  if (!result.success) {
    return { success: false, error: "Invalid submission format" };
  }

  const { userId, responses } = result.data;

  try {
    // Manual transaction control
    await sql`BEGIN`;

    try {
      // Delete any existing responses for this user (in case they're re-taking the survey)
      await sql`DELETE FROM survey_responses WHERE user_id = ${userId}`;

      // Insert each response
      for (const response of responses) {
        await sql`
          INSERT INTO survey_responses 
            (user_id, question_id, selected_option_id)
          VALUES
            (${userId}, ${response.questionId}, ${response.selectedOptionId})
        `;
      }

      // Update user's survey completion status
      await sql`
        UPDATE users 
        SET has_completed_survey = TRUE 
        WHERE id = ${userId}
      `;

      await sql`COMMIT`;
    } catch (err) {
      await sql`ROLLBACK`;
      throw err;
    }

    // Revalidate the page to show updated UI
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error saving survey responses:", error);
    return {
      success: false,
      error: "Failed to save your responses. Please try again."
    };
  }
}
