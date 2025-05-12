"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Check if match results are available
 */
export async function checkMatchResultsAvailable() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM match_results
    `;
    return { 
      available: parseInt(result[0].count) > 0,
    };
  } catch (error) {
    console.error("Error checking match results:", error);
    return { available: false };
  }
}

/**
 * Get match results for a specific user
 */
export async function getMatchResults(userId: number) {
  try {
    // Get most similar matches (highest match percentage)
    const mostSimilar = await sql`
      WITH user_matches AS (
        SELECT 
          user_id_1 as other_user_id, 
          match_percentage 
        FROM match_results 
        WHERE user_id_2 = ${userId}
        UNION
        SELECT 
          user_id_2 as other_user_id, 
          match_percentage 
        FROM match_results 
        WHERE user_id_1 = ${userId}
      )
      SELECT 
        um.other_user_id, 
        u.name, 
        um.match_percentage
      FROM 
        user_matches um
      JOIN 
        users u ON um.other_user_id = u.id
      ORDER BY 
        um.match_percentage DESC
      LIMIT 5
    `;

    // Get most different matches (lowest match percentage)
    const mostDifferent = await sql`
      WITH user_matches AS (
        SELECT 
          user_id_1 as other_user_id, 
          match_percentage 
        FROM match_results 
        WHERE user_id_2 = ${userId}
        UNION
        SELECT 
          user_id_2 as other_user_id, 
          match_percentage 
        FROM match_results 
        WHERE user_id_1 = ${userId}
      )
      SELECT 
        um.other_user_id, 
        u.name, 
        um.match_percentage
      FROM 
        user_matches um
      JOIN 
        users u ON um.other_user_id = u.id
      ORDER BY 
        um.match_percentage ASC
      LIMIT 5
    `;

    return { 
      success: true, 
      mostSimilar, 
      mostDifferent 
    };
  } catch (error) {
    console.error("Error fetching match results:", error);
    return { 
      success: false, 
      error: "Failed to fetch match results" 
    };
  }
}

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

/**
 * Get comparison data between two users' responses
 */
export async function getMatchComparison(user1Id: number, user2Id: number) {
  try {
    // Get responses for user 1
    const user1Responses = await sql`
      SELECT 
        sr.question_id,
        q.text as question_text,
        sr.selected_option_id,
        qo.text as option_text
      FROM 
        survey_responses sr
      JOIN 
        questions q ON sr.question_id = q.id
      JOIN 
        question_options qo ON sr.selected_option_id = qo.id
      WHERE 
        sr.user_id = ${user1Id}
      ORDER BY 
        q.order_position ASC
    `;

    // Get responses for user 2
    const user2Responses = await sql`
      SELECT 
        sr.question_id,
        sr.selected_option_id,
        qo.text as option_text
      FROM 
        survey_responses sr
      JOIN 
        question_options qo ON sr.selected_option_id = qo.id
      WHERE 
        sr.user_id = ${user2Id}
      ORDER BY 
        sr.question_id ASC
    `;

    // Create a map of user 2 responses for easier lookup
    const user2ResponsesMap = new Map();
    
    user2Responses.forEach((response) => {
      user2ResponsesMap.set(response.question_id, {
        selected_option_id: response.selected_option_id,
        option_text: response.option_text
      });
    });

    // Combine the responses
    const comparisons = user1Responses.map((user1Response) => {
      const user2Response = user2ResponsesMap.get(user1Response.question_id);
      
      if (!user2Response) {
        return null; // User 2 didn't answer this question
      }
      
      return {
        question_id: user1Response.question_id,
        question_text: user1Response.question_text,
        user1_option_text: user1Response.option_text,
        user2_option_text: user2Response.option_text,
        is_same: user1Response.selected_option_id === user2Response.selected_option_id
      };
    }).filter(Boolean); // Remove any null entries

    return { success: true, data: comparisons };
  } catch (error) {
    console.error("Error fetching match comparison:", error);
    return { 
      success: false, 
      error: "Failed to fetch comparison data" 
    };
  }
}

/**
 * Generate match results between all surveyed users
 */
export async function generateMatchResults() {
  try {
    // Start transaction
    await sql`BEGIN`;

    try {
      // Clear existing match results
      await sql`TRUNCATE TABLE match_results`;

      // Get all users who have completed the survey
      const users = await sql`
        SELECT id FROM users WHERE has_completed_survey = TRUE ORDER BY id
      `;

      // For each pair of users, calculate the similarity
      for (let i = 0; i < users.length; i++) {
        const user1 = users[i];

        for (let j = i + 1; j < users.length; j++) {
          const user2 = users[j];

          // Get common answers
          const commonAnswersResult = await sql`
            SELECT COUNT(*) as common_count
            FROM survey_responses sr1
            JOIN survey_responses sr2 ON 
              sr1.question_id = sr2.question_id AND
              sr1.selected_option_id = sr2.selected_option_id
            WHERE 
              sr1.user_id = ${user1.id} AND 
              sr2.user_id = ${user2.id}
          `;

          // Get total questions both users answered
          const totalPossibleResult = await sql`
            SELECT COUNT(DISTINCT sr1.question_id) as total_count
            FROM survey_responses sr1
            JOIN survey_responses sr2 ON 
              sr1.question_id = sr2.question_id
            WHERE 
              sr1.user_id = ${user1.id} AND 
              sr2.user_id = ${user2.id}
          `;

          const commonAnswers = parseInt(commonAnswersResult[0].common_count);
          const totalPossible = parseInt(totalPossibleResult[0].total_count);

          // Calculate percentage (handle division by zero)
          const matchPercentage = totalPossible > 0
            ? (commonAnswers / totalPossible) * 100
            : 0;

          // Store the result
          await sql`
            INSERT INTO match_results 
              (user_id_1, user_id_2, common_answers, total_possible, match_percentage)
            VALUES
              (${user1.id}, ${user2.id}, ${commonAnswers}, ${totalPossible}, ${matchPercentage})
          `;
        }
      }

      await sql`COMMIT`;

      // Revalidate the results page
      revalidatePath("/admin/results");

      return {
        success: true,
        message: "Match results generated successfully"
      };
    } catch (err) {
      await sql`ROLLBACK`;
      throw err;
    }
  } catch (error) {
    console.error("Error generating match results:", error);
    return {
      success: false,
      error: typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : "Failed to generate match results. Please try again."
    };
  }
}
