/**
 * Type definitions for the DataMatch application
 */

/**
 * API response for a user's survey response
 */
export interface UserResponseApiData {
  question_id: number;
  selected_option_id: number;
  question_text: string;
  option_text: string;
}
