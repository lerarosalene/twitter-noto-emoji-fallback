import api from "./api";

const IS_EMOJI_REGEX = /^\/emoji\/v2\/svg\/(.*).svg$/;

window.addEventListener("error", event => {
  if (event.target && event.target.tagName === "IMG") {
    const match = new URL(event.target.src).pathname.match(IS_EMOJI_REGEX);
    console.log(match);
    if (!match) {
      return;
    }

    const codepoints = match[1].split('-').filter(cp => cp !== 'fe0f');
    const notoCode = codepoints.join('_');

    const url = api.runtime.getURL(`emoji/emoji_u${notoCode}.svg`);
    event.target.src = url;
  }
}, true);
