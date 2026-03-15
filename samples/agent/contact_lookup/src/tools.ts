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
 * Contact data lookup tool — TypeScript port of tools.py
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Contact {
  id: string;
  name: string;
  title: string;
  team: string;
  department: string;
  location: string;
  email: string;
  mobile: string;
  calendar: string;
  imageUrl: string;
}

function loadContacts(baseUrl?: string): Contact[] {
  const filePath = path.join(__dirname, '..', 'contact_data.json');
  let raw = readFileSync(filePath, 'utf-8');
  if (baseUrl) {
    raw = raw.replaceAll('http://localhost:10002', baseUrl);
  }
  return JSON.parse(raw) as Contact[];
}

export function getContactInfo(
  name: string,
  baseUrl: string,
  department: string = '',
): string {
  console.log(`[tool] get_contact_info(name=${name}, department=${department})`);

  const contacts = loadContacts(baseUrl);
  const nameLower = name.toLowerCase();
  const deptLower = department.toLowerCase();

  let results = contacts.filter((c) => c.name.toLowerCase().includes(nameLower));
  if (deptLower) {
    results = results.filter((c) => c.department.toLowerCase().includes(deptLower));
  }

  console.log(`[tool] Found ${results.length} matching contacts`);
  return JSON.stringify(results);
}
