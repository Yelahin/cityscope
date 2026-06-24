const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export default async function fetchApi (path:string, options?: RequestInit) {
    try {
        const response = await fetch(apiUrl + path, options);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}