

import * as Types from '@a2ui/web_core/types/types';

export interface A2TextPayload {
  kind: 'text';
  text: string;
}

export interface A2DataPayload {
  kind: 'data';
  data: Types.ServerToClientMessage;
}

export type A2AServerPayload = Array<A2DataPayload | A2TextPayload> | { error: string };
