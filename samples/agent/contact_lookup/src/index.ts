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
 * Entry point for the Contact Lookup A2A agent server.
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { A2uiSchemaManager, BasicCatalog, VERSION_0_8 } from '@a2ui/agent-sdk';
import { ContactAgent } from './agent.js';
import { createServer, buildAgentCard, attachHandlers } from './server.js';

if (!process.env['LLM_API_KEY'] && !process.env['OPENAI_API_KEY'] && !process.env['DASHSCOPE_API_KEY']) {
  console.error('Error: set one of LLM_API_KEY / OPENAI_API_KEY / DASHSCOPE_API_KEY.');
  process.exit(1);
}

const HOST = process.env['HOST'] ?? 'localhost';
const PORT = parseInt(process.env['PORT'] ?? '10003', 10);
const BASE_URL = `http://${HOST}:${PORT}`;

// Build shared schema manager (for agent card / extension params)
const uiSchemaManager = new A2uiSchemaManager({
  version: VERSION_0_8,
  catalogs: [BasicCatalog.getConfig(VERSION_0_8, 'examples')],
});

const uiAgent = new ContactAgent(BASE_URL, true);
const textAgent = new ContactAgent(BASE_URL, false);
const agentCard = buildAgentCard(BASE_URL, uiSchemaManager);

const app = createServer();

// Serve profile images if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '..', 'images');
app.use('/static', express.static(imagesDir));

attachHandlers(app, () => agentCard, async (query, useUI) => {
  const agent = useUI ? uiAgent : textAgent;
  return agent.stream(query);
});

app.listen(PORT, HOST, () => {
  console.log(`Contact Lookup Agent running at ${BASE_URL}`);
  console.log(`Agent card:  ${BASE_URL}/.well-known/agent-card.json`);
});
