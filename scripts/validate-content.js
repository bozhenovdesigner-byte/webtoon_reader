const fs = require('fs');
const path = require('path');

const STORIES_DIR = path.join(__dirname, '..', 'content', 'stories');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
let errors = 0;

function fail(message) {
    console.error(`✕ ${message}`);
    errors++;
}

if (!fs.existsSync(STORIES_DIR)) {
    console.log('No content/stories directory. Nothing to validate.');
    process.exit(0);
}

for (const storyId of fs.readdirSync(STORIES_DIR)) {
    const storyPath = path.join(STORIES_DIR, storyId);
    if (!fs.statSync(storyPath).isDirectory()) continue;

    const episodesPath = path.join(storyPath, 'episodes');
    if (!fs.existsSync(episodesPath)) {
        fail(`${storyId}: missing episodes directory`);
        continue;
    }

    const numbers = new Set();
    for (const episodeId of fs.readdirSync(episodesPath)) {
        const episodePath = path.join(episodesPath, episodeId);
        if (!fs.statSync(episodePath).isDirectory()) continue;

        const match = episodeId.match(/^(\d+)/);
        if (!match) fail(`${storyId}/${episodeId}: folder must start with episode number`);
        else if (numbers.has(match[1])) fail(`${storyId}: duplicate episode number ${match[1]}`);
        else numbers.add(match[1]);

        const imagesPath = path.join(episodePath, 'images');
        if (!fs.existsSync(imagesPath)) {
            fail(`${storyId}/${episodeId}: missing images directory`);
            continue;
        }

        const images = fs.readdirSync(imagesPath).filter(file => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
        if (!images.length) fail(`${storyId}/${episodeId}: no jpg/jpeg/png images`);

        const imageNumbers = new Set();
        for (const image of images) {
            const imageMatch = image.match(/^(\d+)/);
            if (!imageMatch) fail(`${storyId}/${episodeId}/${image}: filename must start with a number`);
            else if (imageNumbers.has(imageMatch[1])) fail(`${storyId}/${episodeId}: duplicate image number ${imageMatch[1]}`);
            else imageNumbers.add(imageMatch[1]);
        }
    }
}

if (errors) {
    console.error(`\nValidation failed: ${errors} error(s).`);
    process.exit(1);
}
console.log('✓ Content validation passed.');
