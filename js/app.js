// Main application logic
const App = {
    async loadData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    },

    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    navigateTo(page, params = {}) {
        const url = new URL(page, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value);
        });
        window.location.href = url.toString();
    },

    renderError(message) {
        document.getElementById('app').innerHTML = `
            <div class="container main">
                <h2>Ошибка</h2>
                <p>${message}</p>
                <a href="index.html" class="btn">На главную</a>
            </div>
        `;
    }
};
