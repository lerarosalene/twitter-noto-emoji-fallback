import api from "./api";
import { Message, MessageType } from "./messages";


class BackgroundScript {
  private ports: Set<chrome.runtime.Port> = new Set();

  private registerPort(this: BackgroundScript, port: chrome.runtime.Port) {
    this.ports.add(port);
    port.onDisconnect.addListener(port => {
      this.ports.delete(port);
    });
    port.onMessage.addListener(this.handleMessage.bind(this));
  }

  private async handleMessage(this: BackgroundScript, message: Message, port: chrome.runtime.Port) {
    if (message.type === MessageType.SETTINGS_REQUEST) {
      const { replaceAll } = await api.storage.local.get("replaceAll");
      port.postMessage({
        type: MessageType.SETTINGS_RESPONSE,
        replaceAll: Boolean(replaceAll ?? false)
      });
      return;
    }

    if (message.type === MessageType.SETTINGS_CHANGE) {
      await api.storage.local.set({ replaceAll: message.replaceAll });
      this.ports.forEach(port => {
        port.postMessage({ type: MessageType.SETTINGS_RESPONSE, replaceAll: message.replaceAll });
      });
      return;
    }
  }

  start() {
    api.runtime.onConnect.addListener(this.registerPort.bind(this));
  }
}

const script = new BackgroundScript();
script.start();
