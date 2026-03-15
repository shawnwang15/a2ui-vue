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
 * A2UI Agent — Node.js
 *
 * This module demonstrates how to use the @a2ui/agent-sdk to build an A2UI-aware
 * agent. It is the Node.js equivalent of the Python a2ui_agent.
 *
 * The agent:
 *  1. Loads the basic A2UI catalog for the chosen protocol version.
 *  2. Creates an A2uiSchemaManager to manage schemas and system-prompt generation.
 *  3. Exposes helper functions for processing LLM responses that include A2UI JSON blocks.
 */

import {
  A2uiSchemaManager,
  BasicCatalog,
  VERSION_0_9,
  parseResponse,
  hasA2uiParts,
  createA2uiPart,
  getA2uiAgentExtension,
  parseResponseToParts,
  type A2APart,
  type ClientUiCapabilities,
} from '@a2ui/agent-sdk';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** A2UI protocol version used by this agent. */
const A2UI_VERSION = VERSION_0_9;

// ---------------------------------------------------------------------------
// Schema manager (singleton per process)
// ---------------------------------------------------------------------------

function createSchemaManager(
  version: string = A2UI_VERSION,
  examplesPath?: string,
): A2uiSchemaManager {
  const basicCatalogConfig = BasicCatalog.getConfig(version, examplesPath);
  return new A2uiSchemaManager({
    version,
    catalogs: [basicCatalogConfig],
  });
}

// ---------------------------------------------------------------------------
// A2UIAgent class
// ---------------------------------------------------------------------------

export interface A2UIAgentOptions {
  /** Protocol version, defaults to '0.9'. */
  version?: string;
  /** Path to examples directory for the basic catalog. */
  examplesPath?: string;
  /** Whether the agent accepts inline catalogs from clients. */
  acceptsInlineCatalogs?: boolean;
}

export class A2UIAgent {
  private readonly _manager: A2uiSchemaManager;

  constructor(opts: A2UIAgentOptions = {}) {
    const version = opts.version ?? A2UI_VERSION;
    const basicCatalogConfig = BasicCatalog.getConfig(version, opts.examplesPath);
    this._manager = new A2uiSchemaManager({
      version,
      catalogs: [basicCatalogConfig],
      acceptsInlineCatalogs: opts.acceptsInlineCatalogs ?? false,
    });
  }

  /**
   * Generates a complete system prompt for the LLM, including A2UI schema/examples.
   */
  generateSystemPrompt(opts: {
    roleDescription: string;
    workflowDescription?: string;
    uiDescription?: string;
    clientUiCapabilities?: ClientUiCapabilities | null;
    allowedComponents?: string[];
    includeSchema?: boolean;
    includeExamples?: boolean;
    validateExamples?: boolean;
  }): string {
    return this._manager.generateSystemPrompt(opts);
  }

  /**
   * Returns the A2UI AgentExtension descriptor for publishing in the agent card.
   */
  getAgentExtension() {
    return getA2uiAgentExtension({
      acceptsInlineCatalogs: this._manager.acceptsInlineCatalogs,
      supportedCatalogIds: this._manager.supportedCatalogIds,
    });
  }

  /**
   * Parses an LLM response that may contain A2UI JSON blocks.
   * Returns a list of A2A-compatible Part objects.
   */
  parseResponse(content: string, fallbackText?: string): A2APart[] {
    if (!hasA2uiParts(content)) {
      // Plain text response — return as a single TextPart
      return content.trim() ? [{ root: { text: content.trim() } }] : [];
    }
    return parseResponseToParts(content, undefined, fallbackText);
  }

  /**
   * Validates an A2UI JSON payload against the selected catalog schema.
   */
  validate(
    a2uiJson: unknown,
    clientUiCapabilities?: ClientUiCapabilities | null,
    allowedComponents?: string[],
  ): void {
    const catalog = this._manager.getSelectedCatalog(clientUiCapabilities, allowedComponents ?? []);
    catalog.validator.validate(a2uiJson);
  }
}

// ---------------------------------------------------------------------------
// Default export for quick usage
// ---------------------------------------------------------------------------

export { createSchemaManager, parseResponse, hasA2uiParts, createA2uiPart };
