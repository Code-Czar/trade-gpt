// import fetch from 'node-fetch';

export enum API_STATUS {
    SUCCESS = "Success",
    ERROR = "Error",
}
type APIResult = {
    status: number | API_STATUS;
    data?: BasicObject | ReadableStream<Uint8Array> | string | undefined | null;
    headers?: BasicObject | undefined | null;
    filename?: string
};

const defaultHeaders = {
    'Content-Type': 'application/json'
}


async function handleResponse(response: Response): Promise<any> {
    try {
        return await response.json();
    } catch (error) {
        return await response.text();
    }
}

async function handleURL(url: string) {
    url = url.trim();
    if (!url.includes("localhost") && !url.includes("127.0.0.1") && !url.startsWith('https://') && !url.startsWith('http://')) {
        url = "https://" + url;
    } else if (url.startsWith('127.0.0.1')) {
        url = 'http://' + url
    }
    console.log("🚀 ~ file: apiConnector.ts:28 ~ url:", url);
    return url;

}

export async function get(url: string, parameters = {}, headers = defaultHeaders) {

    url = await handleURL(url)

    const result: APIResult = {
        data: {},
        status: 0,
    };
    let response;
    try {
        console.log("🚀 ~ file: apiConnector.ts:102 ~ url:", url);

        response = await fetch(url, {
            method: "GET",
            headers,
            // Add other fetch options here as needed
        });

        result.status = response.status;
        result.headers = response.headers;

        for (var pair of response.headers.entries()) {
            //@ts-ignore
            result.headers[pair[0]] = pair[1];
        }
        if (response.status === 200) {
            //@ts-ignore
            if (response.responseType === "blob") {
                // result.data = await response.blob();
                result.data = response.arrayBuffer();
                //@ts-ignore
                result.filename = (await response.headers)
                    ?.get("content-disposition")?.split("/");
                //@ts-ignore
                result.filename = result.filename[result.filename.length - 1];
                result.filename = result.filename.replace(/"/g, "");
            } else {
                //@ts-ignore
                result.data = await response.json();
                // console.log("🚀 ~ file: apiConnector.ts:68 ~ result.data:", result.data);
            }
        } else {
            console.error("Error status:", response.status);
            // Handle other HTTP status codes as needed
        }
    } catch (error: any) {
        console.error("Fetch error 2:", error, error?.message, response, url);
        result.status = API_STATUS.ERROR;
    }

    return result;
}

export async function post(url: string, data: Object, headers = defaultHeaders): Promise<APIResult> {
    console.log("🚀 ~ file: apiConnector.ts:73 ~ data:", data, typeof data, url);

    url = await handleURL(url)

    const result: APIResult = {
        data: {},
        status: 0,
    };

    try {
        console.log("🚀 ~ file: apiConnector.ts:102 ~ url:", url);
        const response = await fetch(url, {
            body: typeof data === 'object' ? JSON.stringify(data) : data,
            headers,
            method: "POST",
        });

        result.status = response.status;

        try {
            result.data = await response.json();
            console.log("🚀 ~ file: apiConnector.ts:96 ~ result.data:", result.data);
        } catch (error) {
            // If parsing JSON fails, store the raw response body
            result.data = await response.text();
            console.log("🚀 ~ file: apiConnector.ts:100 ~ result.data:", result.data);
        }
    } catch (error) {
        // If the fetch itself fails, set the status to error
        result.status = API_STATUS.ERROR;
    }

    return result;
}




export async function put(url: string, data: Object, headers = defaultHeaders): Promise<APIResult> {
    const result: APIResult = {
        data: {},
        status: 0,
    };

    url = await handleURL(url)

    try {
        const response = await fetch(url, {
            body: typeof data === 'object' ? JSON.stringify(data) : data,
            headers,
            method: "PUT",
        });

        result.status = response.status;
        result.data = await handleResponse(response);
    } catch (error) {
        console.trace();
        result.status = API_STATUS.ERROR;
    }

    return result;
}

export async function patch(url: string, data: Object, headers = defaultHeaders): Promise<APIResult> {
    console.log("🚀 ~ file: apiConnector.ts:163 ~ data:", data, typeof data);

    url = await handleURL(url)
    const result: APIResult = {
        data: {},
        status: 0,
    };

    if (!url) {
        console.trace();
    }

    try {
        const response = await fetch(url, {
            body: typeof data === 'object' ? JSON.stringify(data) : data,
            headers,
            method: "PATCH",
        });

        result.status = response.status;
        result.data = await handleResponse(response);
    } catch (error) {
        result.status = API_STATUS.ERROR;
    }

    return result;
}


export async function remove(url: string, data, headers = defaultHeaders) {
    const result: APIResult = {
        data: {},
        status: 0,
    };
    url = await handleURL(url)

    try {
        const response = await fetch(url, {
            headers,
            method: "DELETE",
            body: typeof data === 'object' ? JSON.stringify(data) : data,
        });
        result.status = response.status;
        result.data = await handleResponse(response);
        // result.data = requestResult;
    } catch (error) {
        result.status = API_STATUS.ERROR;
    }

    return result;
}

export default {
    get,
    patch,
    post,
    put,
    remove,
};
