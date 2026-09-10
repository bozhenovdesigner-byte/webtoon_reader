const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const GENERATED_DIR = path.join(__dirname, '..', 'generated');

if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

function readTextFile(filePath) {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8').trim();
    return null;
}

function getNumericPrefix(name) {
    const match = name.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function findCover(dir) {
    for (const ext of ['.jpg', '.jpeg', '.png']) {
        const file = `cover${ext}`;
        if (fs.existsSync(path.join(dir, file))) return file;
    }
    return null;
}

function getImages(imagesDir) {
    if (!fs.existsSync(imagesDir)) return [];
    const allowed = ['.jpg', '.jpeg', '.png'];
    return fs.readdirSync(imagesDir)
        .filter(file => allowed.includes(path.extname(file).toLowerCase()))
        .sort((a, b) => getNumericPrefix(a) - getNumericPrefix(b));
}

function scanStories() {
    const storiesDir = path.join(CONTENT_DIR, 'stories');
    if (!fs.existsSync(storiesDir)) return [];

    const storyDirs = fs.readdirSync(storiesDir).filter(item =>
        fs.statSync(path.join(storiesDir, item)).isDirectory()
    );

    const stories = [];

    for (const storyDir of storyDirs) {
        const storyPath = path.join(storiesDir, storyDir);
        const title = readTextFile(path.join(storyPath, 'title.txt')) || storyDir;
        const description = readTextFile(path.join(storyPath, 'description.txt')) || '';
        const storyCover = findCover(storyPath);
        const episodesDir = path.join(storyPath, 'episodes');

        if (!fs.existsSync(episodesDir)) continue;

        const episodeDirs = fs.readdirSync(episodesDir).filter(item =>
            fs.statSync(path.join(episodesDir, item)).isDirectory()
        );

        const episodes = [];

        for (const episodeDir of episodeDirs) {
            const episodePath = path.join(episodesDir, episodeDir);
            const episodeNumber = getNumericPrefix(episodeDir);
            const episodeTitle = readTextFile(path.join(episodePath, 'title.txt')) || episodeDir.replace(/^\d+\s*-\s*/, '');
            const episodeDescription = readTextFile(path.join(episodePath, 'description.txt')) || '';
            const images = getImages(path.join(episodePath, 'images'));

            if (!images.length) {
                console.warn(`Episode "${episodeDir}" has no images`);
                continue;
            }

            const basePath = `content/stories/${storyDir}/episodes/${episodeDir}`;
            const episodeCoverFile = findCover(episodePath);
            const episodeCover = episodeCoverFile
                ? `${basePath}/${episodeCoverFile}`
                : `${basePath}/images/${images[0]}`;

            episodes.push({
                number: episodeNumber,
                id: episodeDir,
                title: episodeTitle,
                description: episodeDescription,
                cover: episodeCover,
                images: images.map(img => `${basePath}/images/${img}`),
                imageCount: images.length
            });
        }

        episodes.sort((a, b) => a.number - b.number);

        if (episodes.length) {
            stories.push({
                id: storyDir,
                title,
                description,
                cover: storyCover
                    ? `content/stories/${storyDir}/${storyCover}`
                    : episodes[0].cover,
                episodes,
                episodeCount: episodes.length
            });
        }
    }

    return stories;
}

function cleanGenerated() {
    if (!fs.existsSync(GENERATED_DIR)) return;
    for (const item of fs.readdirSync(GENERATED_DIR)) {
        const itemPath = path.join(GENERATED_DIR, item);
        fs.rmSync(itemPath, { recursive: true, force: true });
    }
}

function generateData() {
    cleanGenerated();
    fs.mkdirSync(path.join(GENERATED_DIR, 'episodes'), { recursive: true });

    const stories = scanStories();
    console.log(`Found ${stories.length} story(s)`);

    const storiesIndex = stories.map(({ id, title, description, cover, episodeCount }) => ({
        id, title, description, cover, episodeCount
    }));
    fs.writeFileSync(path.join(GENERATED_DIR, 'stories.json'), JSON.stringify(storiesIndex, null, 2));

    for (const story of stories) {
        fs.writeFileSync(path.join(GENERATED_DIR, `${story.id}.json`), JSON.stringify(story, null, 2));
        for (const episode of story.episodes) {
            const episodeData = { storyId: story.id, storyTitle: story.title, ...episode };
            const fileName = `${story.id}_${episode.id.replace(/\s+/g, '_')}.json`;
            fs.writeFileSync(path.join(GENERATED_DIR, 'episodes', fileName), JSON.stringify(episodeData, null, 2));
        }
    }

    console.log('Data generation complete!');
}

if (require.main === module) generateData();
module.exports = { generateData, scanStories };
