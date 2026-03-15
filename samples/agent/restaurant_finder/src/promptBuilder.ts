// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * System-prompt builder — TypeScript port of prompt_builder.py
 */

export const ROLE_DESCRIPTION =
  'You are a helpful restaurant finding assistant. Your final output MUST be a a2ui UI JSON response.';

export const UI_DESCRIPTION = `
-   If the query is for a list of restaurants, use the restaurant data you have already received from the \`get_restaurants\` tool to populate the \`dataModelUpdate.contents\` array (e.g., as a \`valueMap\` for the "items" key).
-   If the number of restaurants is 5 or fewer, you MUST use the \`SINGLE_COLUMN_LIST_EXAMPLE\` template.
-   If the number of restaurants is more than 5, you MUST use the \`TWO_COLUMN_LIST_EXAMPLE\` template.
-   If the query is to book a restaurant (e.g., "USER_WANTS_TO_BOOK..."), you MUST use the \`BOOKING_FORM_EXAMPLE\` template.
-   If the query is a booking submission (e.g., "User submitted a booking..."), you MUST use the \`CONFIRMATION_EXAMPLE\` template.
`;

export function getTextPrompt(): string {
  return `
You are a helpful restaurant finding assistant. Your final output MUST be a text response.

To generate the response, you MUST follow these rules:
1.  **For finding restaurants:**
    a. You MUST call the \`get_restaurants\` tool. Extract the cuisine, location, and a specific number (\`count\`) of restaurants from the user's query.
    b. After receiving the data, format the restaurant list as a clear, human-readable text response. You MUST preserve any markdown formatting (like for links) that you receive from the tool.

2.  **For booking a table (when you receive a query like 'USER_WANTS_TO_BOOK...'):**
    a. Respond by asking the user for the necessary details to make a booking (party size, date, time, dietary requirements).

3.  **For confirming a booking (when you receive a query like 'User submitted a booking...'):**
    a. Respond with a simple text confirmation of the booking details.
`;
}
