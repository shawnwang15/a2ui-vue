// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Entry point for the Component Gallery A2A agent server.
 * Usage:  PORT=10005 node --loader tsx src/index.ts
 */

import express from 'express';
import 'dotenv/config';
import { ComponentGalleryAgent } from './agent.js';
import {
  createServer,
  attachMessageSendHandler,
  buildAgentCard,
  resolveAssetsDir,
} from './server.js';
import path from 'path';
import { existsSync } from 'fs';

const HOST = process.env['HOST'] ?? 'localhost';
const PORT = parseInt(process.env['PORT'] ?? '10005', 10);
const BASE_URL = `http://${HOST}:${PORT}`;

const agentCard = buildAgentCard(BASE_URL);
const galleryAgent = new ComponentGalleryAgent(BASE_URL);

const app = createServer(() => agentCard);

attachMessageSendHandler(app, async (query) => {
  return galleryAgent.process(query);
});

// Serve static assets (images etc.)
const assetsDir = resolveAssetsDir();
if (existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
} else {
  console.warn(`Assets directory not found at ${assetsDir}`);
}

app.listen(PORT, HOST, () => {
  console.log(`Component Gallery Agent running at ${BASE_URL}`);
  console.log(`Agent card:  ${BASE_URL}/.well-known/agent-card.json`);
});
