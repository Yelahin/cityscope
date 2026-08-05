import { ApiErrorResponse, PaginatedResponse } from "../types";

const clientApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const serverApiUrl = process.env.API_INTERNAL_BASE_URL


export class ApiError extends Error {
    status: number;
    data: ApiErrorResponse | null;

    constructor(message: string, status: number, data: ApiErrorResponse | null) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

let csrfToken: string | null = null;

async function getCsrfToken(serverFetch: boolean = false) {
    if (csrfToken) return csrfToken;

    const apiUrl = serverFetch ? serverApiUrl : clientApiUrl;

    const response = await fetch(apiUrl + "csrf/", {credentials: "include"});
    if (!response.ok) {
        throw new ApiError(`API error: ${response.status}`, response.status, null);
    }

    const data: {csrfToken: string} = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
}

function isUnsafeMethod(method?: string) {
    return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(
        (method ?? "GET").toUpperCase(),
    );
}

export default async function fetchApi<T = ApiErrorResponse>(
    path: string,
    pageSize?: number,
    serverFetch: boolean = false,
    options?: RequestInit,
): Promise<T> {
    const headers = new Headers(options?.headers);
    if (isUnsafeMethod(options?.method)) {
        headers.set("X-CSRFToken", await getCsrfToken());
    }

    let query;

    if (serverFetch) {
        query = serverApiUrl + path;
    } else {
        query = clientApiUrl + path;
    }


    if (!!pageSize) {
        const separator = query.includes("?") ? "&" : "?";
        query += `${separator}page_size=${pageSize}`;
    }

    const response = await fetch(query, {
        ...options,
        credentials: "include",
        headers,
    });
    const data = response.status === 204
        ? null
        : await response.json() as ApiErrorResponse;

    if (!response.ok) {
        throw new ApiError(`API error: ${response.status}`, response.status, data);
    }

    return data as T;
}

export async function fetchAllPages<T>(path: string, pageSize?: number, serverFetch: boolean = false) {
    const results: T[] = [];
    let page = 1;

    while (true) {
        const separator = path.includes("?") ? "&" : "?";
        const response: PaginatedResponse<T> = await fetchApi(
            `${path}${separator}page=${page}`,
            pageSize,
            serverFetch,
        );
        results.push(...response.results);

        if (!response.next) return results;
        page += 1;
    }
}
