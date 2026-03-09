const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const BASE_URL = "https://api.github.com";

const headers = {
    "Authorization": `Bearer ${TOKEN}`,
    "Accept": "application/vnd.github.v3+json"
};

export const fetchReposData = async (owner, repos) => {
    try {
        const response = await fetch(`${BASE_URL}/repos/${owner}/${repos}`, { headers });
        if (!response.ok) throw new Error("Репозиторий не найден");
        return await response.json();
    } catch (error) {
        console.error("Github API Error:", error);
        return null;
    }
};

export const fetchUserData = async (username) => {
    try {
        const response = await fetch(`${BASE_URL}/users/${username}`, { headers });
        if (!response.ok) throw new Error("Пользователь не найден");
        return await response.json();
    } catch (error) {
        console.error("Github API Error:", error);
        return null;
    }
};