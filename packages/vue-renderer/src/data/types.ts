

import type { A2uiMessage } from '@a2ui/web_core/v0_9';

export interface A2TextPayload {
  kind: 'text';
  text: string;
}

export interface A2DataPayload {
  kind: 'data';
  data: A2uiMessage;
}

export type A2AServerPayload = Array<A2DataPayload | A2TextPayload> | { error: string };
