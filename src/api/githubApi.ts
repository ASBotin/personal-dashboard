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
    page: number = 1,
    activeTab: 'issues' | 'pullRequests' = 'issues'
) => {
    const isRepoMode = !!(owner && repo);

    // Вспомогательная функция для загрузки самих данных через List API
    const fetchListItems = async (type: 'issue' | 'pr', targetPage: number) => {
        const endpoint = type === 'pr' ? 'pulls' : 'issues';
        const url = `${BASE_URL}/repos/${owner}/${repo}/${endpoint}?state=open&per_page=20&page=${targetPage}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`List API Error: ${res.status}`);
        let items = await res.json();
        if (type === 'issue') items = items.filter((item: any) => !item.pull_request);
        return items;
    };

    // Вспомогательная функция для поиска 
    const fetchSearchItems = async (type: 'issue' | 'pr', targetPage: number) => {
        const userPart = username ? `author:${username}` : "";
        const repoPart = (owner && repo) ? `repo:${owner}/${repo}` : "";
        const query = `is:${type} state:open ${userPart} ${repoPart}`.trim();
        const url = `${BASE_URL}/search/issues?q=${encodeURIComponent(query)}&per_page=20&page=${targetPage}`;
        const res = await fetch(url, { headers });
        const data = await res.json();
        return { items: data.items || [], total: data.total_count || 0 };
    };

    try {
        if (isRepoMode && !username) {
            if (page === 1) {
                // На 1 странице берем и данные, и точные счетчики через Search
                const qI = `is:issue state:open repo:${owner}/${repo}`;
                const qP = `is:pr state:open repo:${owner}/${repo}`;
                
                const [countI, countP, itemsI, itemsP] = await Promise.all([
                    fetch(`${BASE_URL}/search/issues?q=${encodeURIComponent(qI)}&per_page=1`, { headers }).then(r => r.json()),
                    fetch(`${BASE_URL}/search/issues?q=${encodeURIComponent(qP)}&per_page=1`, { headers }).then(r => r.json()),
                    fetchListItems('issue', 1),
                    fetchListItems('pr', 1)
                ]);

                return {
                    issues: itemsI,
                    issuesTotal: countI.total_count || 0,
                    pullRequests: itemsP,
                    pullRequestsTotal: countP.total_count || 0
                };
            } else {
                // На страницах > 1 только данные активной вкладки
                const items = await fetchListItems(activeTab === 'issues' ? 'issue' : 'pr', page);
                return {
                    issues: activeTab === 'issues' ? items : [],
                    issuesTotal: 0, 
                    pullRequests: activeTab === 'pullRequests' ? items : [],
                    pullRequestsTotal: 0
                };
            }
        } else {
            if (page === 1) {
                const [i, p] = await Promise.all([fetchSearchItems('issue', 1), fetchSearchItems('pr', 1)]);
                return { issues: i.items, issuesTotal: i.total, pullRequests: p.items, pullRequestsTotal: p.total };
            } else {
                const res = await fetchSearchItems(activeTab === 'issues' ? 'issue' : 'pr', page);
                return {
                    issues: activeTab === 'issues' ? res.items : [],
                    issuesTotal: res.total,
                    pullRequests: activeTab === 'pullRequests' ? res.items : [],
                    pullRequestsTotal: res.total
                };
            }
        }
    } catch (e) {
        console.error(e);
        return null;
    }
};