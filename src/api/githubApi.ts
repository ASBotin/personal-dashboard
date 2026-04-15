const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const BASE_URL = "https://api.github.com";

const headers = {
    "Authorization": `Bearer ${TOKEN}`,
    "Accept": "application/vnd.github.v3+json"
};

export const fetchReposData = async (owner: string, repos: string) => {
    try {
        const response = await fetch(`${BASE_URL}/repos/${owner}/${repos}`, { headers });
        if (!response.ok) throw new Error("Репозиторий не найден");
        return await response.json();
    } catch (error) {
        console.error("Github API Error:", error);
        return null;
    }
};

export const fetchUserData = async (username: string) => {
    try {
        const response = await fetch(`${BASE_URL}/users/${username}`, { headers });
        if (!response.ok) throw new Error("Пользователь не найден");
        return await response.json();
    } catch (error) {
        console.error("Github API Error:", error);
        return null;
    }
};

export const fetchIssuesPRData = async (
    username?: string, 
    owner?: string, 
    repo?: string, 
    page: number = 1
) => {
    const userPart = username ? `author:${username}` : "";
    const repoPart = (owner && repo) ? `repo:${owner}/${repo}` : "";
    
    if (!userPart && !repoPart) return { issues: [], issuesTotal: 0, pullRequests: [], pullRequestsTotal: 0 };

    const fetchByType = async (type: 'issue' | 'pr') => {
        const query = `is:${type} state:open ${userPart} ${repoPart}`.trim();
        const url = `${BASE_URL}/search/issues?q=${encodeURIComponent(query)}&per_page=20&page=${page}`;
        
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Github Search Error for ${type}`);
        
        const data = await response.json();
        
        return {
            items: data.items || [],
            totalCount: data.total_count || 0
        };
    };

    try {
        const [issuesRes, prRes] = await Promise.all([
            fetchByType('issue'),
            fetchByType('pr')
        ]);

        return { 
            issues: issuesRes.items, 
            issuesTotal: issuesRes.totalCount,
            pullRequests: prRes.items,
            pullRequestsTotal: prRes.totalCount
        };
    } catch (error) {
        console.error("Github API Error:", error);
        return { issues: [], issuesTotal: 0, pullRequests: [], pullRequestsTotal: 0 };
    }
};