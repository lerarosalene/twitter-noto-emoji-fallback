const fs = require('node:fs/promises');
const path = require('node:path');

const esbuild = require('esbuild');
const yaml = require('yaml');
const mustache = require('mustache');

async function config(path) {
  const raw = await fs.readFile(path, 'utf-8');
  const package = JSON.parse(await fs.readFile('package.json', 'utf-8'));
  const data = { version: JSON.stringify(package.version), author: JSON.stringify(package.author) };
  const asYaml = mustache.render(raw, data);
  return yaml.parse(asYaml);
}

function build(entry, outfile) {
  return esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: false,
    define: {
      __EXTENSION_API__: process.env.BROWSER === "firefox" ? "browser" : "chrome",
    },
    outfile: outfile,
    target: "esnext",
  });
}

async function main() {
  const dist = path.join("dist", process.env.BROWSER === "firefox" ? "firefox" : "chrome");
  let manifest = await config(path.join('src', 'manifest.yaml'));
  if (process.env.CHROME_WEBSTORE_VERSION) {
    delete manifest.key;
  } else if (process.env.BROWSER === "firefox") {
    const firefox = await config(path.join('src', 'firefox.yaml'));
    manifest = Object.assign({}, manifest, firefox);
    delete manifest.key;
  }

  await fs.mkdir(dist, { recursive: true });
  await fs.writeFile(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));

  await build(path.join('src', 'content.ts'), path.join(dist, 'content.js'));
  await build(path.join('src', 'bg.ts'), path.join(dist, 'bg.js'));
  await build(path.join('src', 'popup.ts'), path.join(dist, 'popup.js'));
  await fs.copyFile(path.join('src', 'popup.html'), path.join(dist, 'popup.html'));
  await fs.copyFile(require.resolve('bootstrap/dist/css/bootstrap.min.css'), path.join(dist, 'bootstrap.min.css'));
  await fs.copyFile(path.join('src', 'popup.css'), path.join(dist, 'popup.css'));

  const emojiBaseDir = path.join('noto-emoji', 'svg');
  const emojiFiles = await fs.readdir(emojiBaseDir);

  await fs.mkdir(path.join(dist, 'emoji'), { recursive: true });
  for (const file of emojiFiles) {
    await fs.copyFile(path.join(emojiBaseDir, file), path.join(dist, 'emoji', file));
  }

  const flagsBaseDir = path.join('noto-emoji', 'third_party', 'region-flags', 'waved-svg');
  const flagFiles = await fs.readdir(flagsBaseDir);

  await fs.mkdir(path.join(dist, 'emoji'), { recursive: true });
  for (const file of flagFiles) {
    await fs.copyFile(path.join(flagsBaseDir, file), path.join(dist, 'emoji', file));
  }

  await fs.mkdir(path.join(dist, 'icons'), { recursive: true });
  await fs.copyFile(path.join('noto-emoji', 'png', '128', 'emoji_u1f426.png'), path.join(dist, 'icons', '128.png'));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
