// Local storage for reading progress
const Storage = {
    KEYS: {
        LAST_STORY: 'webtoon_last_story',
        LAST_EPISODE: 'webtoon_last_episode',
        READING_POSITION: 'webtoon_reading_position'
    },

    setLastStory(storyId) {
        if (storyId) {
            localStorage.setItem(this.KEYS.LAST_STORY, storyId);
        }
    },

    getLastStory() {
        return localStorage.getItem(this.KEYS.LAST_STORY);
    },

    setLastEpisode(storyId, episodeId) {
        if (storyId && episodeId) {
            const data = { storyId, episodeId };
            localStorage.setItem(this.KEYS.LAST_EPISODE, JSON.stringify(data));
        }
    },

    getLastEpisode() {
        const data = localStorage.getItem(this.KEYS.LAST_EPISODE);
        return data ? JSON.parse(data) : null;
    },

    setReadingPosition(episodeKey, position) {
        if (episodeKey && position) {
            localStorage.setItem(`${this.KEYS.READING_POSITION}_${episodeKey}`, position.toString());
        }
    },

    getReadingPosition(episodeKey) {
        const position = localStorage.getItem(`${this.KEYS.READING_POSITION}_${episodeKey}`);
        return position ? parseInt(position, 10) : 0;
    },

    clearProgress() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
            // Remove any reading positions
            const keys = Object.keys(localStorage).filter(k => k.startsWith(this.KEYS.READING_POSITION));
            keys.forEach(k => localStorage.removeItem(k));
        });
    }
};
