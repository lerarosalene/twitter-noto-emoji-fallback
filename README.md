## <img style="width: 1.2em; vertical-align: -20%" src="https://raw.githubusercontent.com/googlefonts/noto-emoji/546287c772cd64dd2a7350a0727bd68c2e4cf759/svg/emoji_u1f426.svg" alt="bird" /> Twitter Noto Emojis

Twitter's version of emojis lags behind google's one. This extension replaces emojis on twitter with google's [noto emojis](https://github.com/googlefonts/noto-emoji).

This extension can:
- replace emojis that failed to load from twitter cdn
- replace all emojis

### Build it yourself

#### Chrome version for self-distribution
```
npm ci
npm run build
```

#### Chrome version for CWS
```
npm ci
CHROME_WEBSTORE_VERSION=1 npm run build
```

#### Firefox version

```
npm ci
BROWSER=firefox npm run build
```

Then you can find built version in `dist/<browser-name>` where `<browser-name>` is either `chrome` or `firefox`.
