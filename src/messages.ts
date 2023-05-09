export enum MessageType {
  SETTINGS_REQUEST,
  SETTINGS_RESPONSE,
  SETTINGS_CHANGE,
}

interface SettingsRequest {
  type: MessageType.SETTINGS_REQUEST;
}

interface SettingsResponse {
  type: MessageType.SETTINGS_RESPONSE;
  replaceAll: boolean;
}

interface SettingsChange {
  type: MessageType.SETTINGS_CHANGE;
  replaceAll: boolean;
}

export type Message = SettingsRequest | SettingsResponse | SettingsChange;

export const message = (m: Message) => m;
