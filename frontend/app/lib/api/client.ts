const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiErrorResponse {
    message: Record<string, Array<string>>
}

export class ApiError extends Error {
    status: number;
    data: ApiErrorResponse

    constructor(message: string, status: number, data: ApiErrorResponse) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

export default async function fetchApi (path:string, options?: RequestInit) {
    try {
        const response = await fetch(apiUrl + path, options);
        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(`API error: ${response.status}`, response.status, data);
        }
        
        return data;
    } catch (error) {
        if (!(error instanceof ApiError)) {
            console.error(error);
        }
        throw error;
    }
}