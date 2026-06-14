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
 * Mastra tools for the Restaurant Finder agent.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getRestaurants } from './tools.js';

export function createGetRestaurantsTool(baseUrl: string) {
  return createTool({
    id: 'get_restaurants',
    description:
      'Get a list of restaurants based on cuisine and location. Returns JSON array of matching restaurants.',
    inputSchema: z.object({
      cuisine: z.string().describe('The type of cuisine to search for.'),
      location: z.string().describe('The city or location to search in.'),
      count: z
        .number()
        .nullable()
        .describe('The number of restaurants to return (default 5). Pass null to use default.'),
    }),
    execute: async ({ cuisine, location, count }) => {
      return getRestaurants(cuisine, location, baseUrl, count ?? 5);
    },
  });
}
