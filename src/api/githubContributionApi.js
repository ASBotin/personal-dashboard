const BASE_URL = "https://github-contributions-api.jogruber.de/v4/";

export const fetchContributionData = async (username) => {
    try {
        const response = await fetch(`${BASE_URL}${username}`);
        if (!response.ok) throw new Error("Пользователь не найден");
        return await response.json();
    }
    catch (error) {
        console.error("git contribution api error: ", error)
        return null;
    }
}