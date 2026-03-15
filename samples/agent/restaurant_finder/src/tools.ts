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
 * Restaurant data lookup tool — TypeScript port of tools.py
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Restaurant {
  name: string;
  detail: string;
  imageUrl: string;
  rating: string;
  infoLink: string;
  address: string;
}

export function getRestaurants(
  cuisine: string,
  location: string,
  baseUrl: string,
  count: number = 5,
): string {
  console.log(
    `[tool] get_restaurants(cuisine=${cuisine}, location=${location}, count=${count})`,
  );

  if (!location.toLowerCase().includes('new york') && !location.toLowerCase().includes('ny')) {
    console.log('[tool] Location not supported, returning empty list');
    return '[]';
  }

  const filePath = path.join(__dirname, '..', 'restaurant_data.json');
  let raw = readFileSync(filePath, 'utf-8');
  raw = raw.replaceAll('http://localhost:10002', baseUrl);

  const all = JSON.parse(raw) as Restaurant[];
  const items = all.slice(0, count);
  console.log(`[tool] Returning ${items.length} restaurants`);
  return JSON.stringify(items);
}
