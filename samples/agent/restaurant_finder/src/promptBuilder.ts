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
-   If the query is for a list of restaurants, use the restaurant data you have already received from the \`get_restaurants\` tool to populate the \`updateDataModel\` message.
-   IMPORTANT: When using updateDataModel to update items, you MUST specify \`path: "/items"\` in \`updateDataModel\`, and the \`value\` MUST be an array of restaurants.
-   IMPORTANT: Always specify the path when using updateDataModel. The part message is ignored when the path is missing.
-   If the number of restaurants is 5 or fewer, you MUST use the \`SINGLE_COLUMN_LIST_EXAMPLE\` template.
-   If the number of restaurants is more than 5, you MUST use the \`TWO_COLUMN_LIST_EXAMPLE\` template.
-   If the query is to book a restaurant (e.g., "USER_WANTS_TO_BOOK..."), you MUST use the \`BOOKING_FORM_EXAMPLE\` template.
-   If the query is a booking submission (e.g., "User submitted a booking..."), you MUST use the \`CONFIRMATION_EXAMPLE\` template.

CRITICAL DATA-PATH RULES (failing these will produce empty UI):
-   A path that STARTS WITH "/" is an ABSOLUTE path resolved from the data-model root.
-   A path that does NOT start with "/" is a RELATIVE path resolved against the surrounding list-item context.
-   Inside a List template's children (e.g., \`restaurant-card\` and its descendants), you MUST use RELATIVE paths like \`name\`, \`imageUrl\`, \`rating\`, etc.
-   NEVER use absolute paths like \`/name\`, \`/imageUrl\` inside list-item templates — this will search from the root and return empty.
-   Only use an absolute path when you explicitly want data from the root (e.g., \`/items\` in the List \`children.path\`).

CRITICAL SYNTAX RULES (you MUST follow these exactly):
-   To bind a component property to data, you MUST use the object format: \`{ "path": "..." }\`.
-   \`"text": "name"\` means the LITERAL string "name" will be displayed — this is WRONG for dynamic data.
-   \`"text": { "path": "name" }\` means look up the value of "name" from the data model — this is CORRECT.
-   For Image url: \`"url": { "path": "imageUrl" }\` — NOT \`"url": "imageUrl"\`.
-   Every restaurant card MUST include a "Book Now" Button with action event \`book_restaurant\` and context containing \`restaurantName\`, \`imageUrl\`, \`address\` (all using \`{ "path": "..." }\` format).
-   You MUST follow the SINGLE_COLUMN_LIST_EXAMPLE structure exactly — do NOT invent your own template.
-   The \`surfaceId\` MUST be EXACTLY the same string across ALL messages (createSurface, updateComponents, updateDataModel). Use \`"default"\` as the surfaceId for all messages unless there is a specific reason to use another value.
-   Every response MUST contain ALL THREE messages in this exact order: 1) \`createSurface\` 2) \`updateComponents\` 3) \`updateDataModel\`. NEVER omit \`createSurface\` — without it the surface does not exist and all subsequent messages will fail.
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
