import api from "./api";
import { Message, MessageType, message } from "./messages";

class PopupScript {
  private _port: chrome.runtime.Port | null = null;
  private _check: HTMLInputElement | null = null;
  private _main: HTMLDivElement | null = null;

  private handleChange(evt: Event) {
    if (!evt.target || !(evt.target instanceof HTMLInputElement)) {
      return;
    }
    this._port?.postMessage(
      message({
        type: MessageType.SETTINGS_CHANGE,
        replaceAll: evt.target.checked,
      })
    );
  }

  private handleMessage(msg: Message) {
    if (msg.type === MessageType.SETTINGS_RESPONSE && this._check) {
      this._check.checked = msg.replaceAll;
    }
    this._main?.classList.remove('hidden');
  }

  start() {
    this._port = api.runtime.connect();
    this._port.postMessage(message({ type: MessageType.SETTINGS_REQUEST }));
    this._check = document.querySelector("#replace-all");
    this._check?.addEventListener("change", this.handleChange.bind(this));
    this._main = document.querySelector('#main');
    this._port.onMessage.addListener(this.handleMessage.bind(this));
  }
}

const script = new PopupScript();
script.start();
