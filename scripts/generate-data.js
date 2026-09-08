const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const GENERATED_DIR = path.join(__dirname, '..', 'generated');

// Ensure generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

function readTextFile(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8').trim();
    }
    return null;
}

function getNumericPrefix(name) {
    const match = name.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

function findCoverInDir(dirPath, relativeBase) {
    const extensions = ['.jpg', '.jpeg', '.png'];
    for (const ext of extensions) {
        const coverPath = path.join(dirPath, `cover${ext}`);
        if (fs.existsSync(coverPath)) {
            // Return relative path from workspace root for web access
            return path.relative(path.join(__dirname, '..'), coverPath).replace(/\\/g, '/');
        }
    }
    return null;
}

function getImages(imagesDir, basePath) {
    if (!fs.existsSync(imagesDir)) {
        return [];
    }
    
    const files = fs.readdirSync(imagesDir);
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    
    const images = files
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        })
        .sort((a, b) => {
            const numA = getNumericPrefix(a);
            const numB = getNumericPrefix(b);
            return numA - numB;
        });
    
    // Return full relative paths
    return images.map(img => path.join(basePath, 'images', img).replace(/\\/g, '/'));
}

function scanStories() {
    const storiesDir = path.join(CONTENT_DIR, 'stories');
    
    if (!fs.existsSync(storiesDir)) {
        console.log('No stories directory found');
        return [];
    }
    
    const storyDirs = fs.readdirSync(storiesDir).filter(item => {
        const itemPath = path.join(storiesDir, item);
        return fs.statSync(itemPath).isDirectory();
    });
    
    const stories = [];
    
    for (const storyDir of storyDirs) {
        const storyPath = path.join(storiesDir, storyDir);
        const storyId = storyDir;
        const title = readTextFile(path.join(storyPath, 'title.txt')) || storyDir;
        const description = readTextFile(path.join(storyPath, 'description.txt')) || '';
        
        const episodesDir = path.join(storyPath, 'episodes');
        
        if (!fs.existsSync(episodesDir)) {
            console.warn(`Story "${storyDir}" has no episodes directory`);
            continue;
        }
        
        const episodeDirs = fs.readdirSync(episodesDir).filter(item => {
            const itemPath = path.join(episodesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        
        const episodes = [];
        
        for (const episodeDir of episodeDirs) {
            const episodePath = path.join(episodesDir, episodeDir);
            const episodeNumber = getNumericPrefix(episodeDir);
            
            const episodeTitle = readTextFile(path.join(episodePath, 'title.txt')) || episodeDir.replace(/^\d+\s*-\s*/, '');
            const episodeDescription = readTextFile(path.join(episodePath, 'description.txt')) || '';
            
            const imagesDir = path.join(episodePath, 'images');
            const basePath = `content/stories/${storyId}/episodes/${episodeDir}`;
            const images = getImages(imagesDir, basePath);
            
            if (images.length === 0) {
                console.warn(`Episode "${episodeDir}" has no images`);
                continue;
            }
            
            // Find cover: first check for cover.jpg in episode folder, then use first image
            let cover = findCoverInDir(episodePath);
            if (!cover && images.length > 0) {
                cover = images[0];
            }
            
            episodes.push({
                number: episodeNumber,
                id: episodeDir,
                title: episodeTitle,
                description: episodeDescription,
                cover: cover,
                images: images,
                imageCount: images.length
            });
        }
        
        // Sort episodes by number
        episodes.sort((a, b) => a.number - b.number);
        
        // Find cover for story: check for cover.jpg in story folder
        let storyCover = findCoverInDir(storyPath);
        if (!storyCover && episodes.length > 0 && episodes[0].cover) {
            storyCover = episodes[0].cover;
        }
        
        if (episodes.length > 0) {
            stories.push({
                id: storyDir,
                title: title,
                description: description,
                cover: storyCover,
                episodes: episodes,
                episodeCount: episodes.length
            });
        }
    }
    
    return stories;
}

function generateData() {
    console.log('Scanning content...');
    const stories = scanStories();
    
    console.log(`Found ${stories.length} story(s)`);
    
    // Generate main stories.json
    const storiesIndex = stories.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        episodeCount: story.episodeCount
    }));
    
    fs.writeFileSync(
        path.join(GENERATED_DIR, 'stories.json'),
        JSON.stringify(storiesIndex, null, 2)
    );
    console.log('Generated stories.json');
    
    // Generate individual story files
    for (const story of stories) {
        fs.writeFileSync(
            path.join(GENERATED_DIR, `${story.id}.json`),
            JSON.stringify(story, null, 2)
        );
        console.log(`Generated ${story.id}.json`);
    }
    
    // Create episodes subdirectory if needed
    const episodesDir = path.join(GENERATED_DIR, 'episodes');
    if (!fs.existsSync(episodesDir)) {
        fs.mkdirSync(episodesDir, { recursive: true });
    }
    
    // Generate episode files
    for (const story of stories) {
        for (const episode of story.episodes) {
            const episodeData = {
                storyId: story.id,
                storyTitle: story.title,
                ...episode
            };
            
            const episodeFileName = `${story.id}_${episode.id.replace(/\s+/g, '_')}.json`;
            fs.writeFileSync(
                path.join(episodesDir, episodeFileName),
                JSON.stringify(episodeData, null, 2)
            );
        }
    }
    
    console.log('Data generation complete!');
}

generateData();
