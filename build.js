import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import archiver from 'archiver';
import yaml from 'js-yaml';

const PLUGINS_DIR = './plugins';
const OUTPUT_DIR = '_site';

// Clean output directory
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const index = [];

// Find all plugin manifests
const pluginDirs = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const pluginId of pluginDirs) {
  const pluginDir = path.join(PLUGINS_DIR, pluginId);
  const manifestPath = path.join(pluginDir, `${pluginId}.yml`);
  
  if (!fs.existsSync(manifestPath)) {
    console.log(`⚠️  Skipping ${pluginId} - no manifest found`);
    continue;
  }

  console.log(`📦 Processing ${pluginId}...`);

  // Read manifest
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = yaml.load(manifestContent);

  // Create zip
  const zipPath = path.join(OUTPUT_DIR, `${pluginId}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(pluginDir, false);
  
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.finalize();
  });

  // Calculate SHA256
  const fileBuffer = fs.readFileSync(zipPath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // Add to index
  index.push({
    id: pluginId,
    name: manifest.name,
    metadata: {
      description: manifest.description
    },
    version: manifest.version,
    date: new Date().toISOString().split('T')[0],
    path: `${pluginId}.zip`,
    sha256: hash
  });

  console.log(`✅ ${pluginId} v${manifest.version}`);
}

// Write index.yml
const indexYaml = yaml.dump(index);
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.yml'), indexYaml);

console.log(`\n🎉 Built ${index.length} plugin(s) to ${OUTPUT_DIR}/`);
