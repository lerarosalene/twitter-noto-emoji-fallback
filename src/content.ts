import api from "./api";
import { Message, MessageType } from "./messages";
import { Effect } from "./effect";

const IS_EMOJI_REGEX = /^\/emoji\/v2\/svg\/(.*).svg$/;

class ContentScript {
  private _replaceAllEffect = new Effect();
  private _port: chrome.runtime.Port | null = null;

  private enableReplaceAll(this: ContentScript) {
    this._replaceAllEffect.run(() => {
      const timer = setInterval(this.replaceAllTimer.bind(this), 150);
      return () => clearInterval(timer);
    });
  }

  private disableReplaceAll(this: ContentScript) {
    this._replaceAllEffect.end();
  }

  private handleImage(img: HTMLImageElement) {
    const match = new URL(img.src, location.href).pathname.match(IS_EMOJI_REGEX);
    if (!match) {
      return;
    }

    const codepoints = match[1].split('-').filter(cp => cp !== 'fe0f');
    const notoCode = codepoints.join('_');

    const url = api.runtime.getURL(`emoji/emoji_u${notoCode}.svg`);
    img.src = url;
  }

  private handleError(this: ContentScript, event: ErrorEvent) {
    if (!event.target) {
      return;
    }

    if (!(event.target instanceof HTMLImageElement)) {
      return;
    }

    this.handleImage(event.target);
  }

  private handleMessage(this: ContentScript, message: Message) {
    if (message.type === MessageType.SETTINGS_RESPONSE) {
      if (message.replaceAll) {
        this.enableReplaceAll();
      } else {
        this.disableReplaceAll();
      }
    }
  }

  replaceAllTimer(this: ContentScript) {
    const imgs = Array.from(document.getElementsByTagName('img'));
    imgs.forEach(this.handleImage.bind(this));
  }

  start() {
    window.addEventListener("error", this.handleError.bind(this), true);
    this._port = api.runtime.connect();
    this._port.onMessage.addListener(this.handleMessage.bind(this));
    this._port.postMessage({ type: MessageType.SETTINGS_REQUEST });
  }
}

const script = new ContentScript();
script.start();
