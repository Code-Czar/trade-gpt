// import fetch from 'node-fetch';

export enum API_STATUS {
    SUCCESS = "Success",
    ERROR = "Error",
}
type APIResult = {
    status: number | API_STATUS;
    data?: BasicObject | ReadableStream<Uint8Array> | undefined | null;
    headers?: BasicObject | undefined | null;
    filename?: string
};

const defaultHeaders = {
    'Content-Type': 'application/json'
}



export async function get(url: string, parameters = {}, headers = defaultHeaders) {
    url = url.trim();

    if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
        url = "https://" + url;
    }

    const result: APIResult = {
        data: {},
        status: 0,
    };

    try {
        const response = await fetch(url, {
            method: "GET",
            headers,
            // Add other fetch options here as needed
        });

        result.status = response.status;
        result.headers = response.headers;

        for (var pair of response.headers.entries()) {
            result.headers[pair[0]] = pair[1];
        }
        if (response.status === 200) {
            //@ts-ignore
            if (response.responseType === "blob") {
                // result.data = await response.blob();
                result.data = await response.arrayBuffer();
                //@ts-ignore
                result.filename = (await response.headers)
                    ?.get("content-disposition")?.split("/");
                //@ts-ignore
                result.filename = result.filename[result.filename.length - 1];
                result.filename = result.filename.replace(/"/g, "");
            } else {
                //@ts-ignore
                result.data = await response.json();
            }
        } else {
            console.error("Error status:", response.status);
            // Handle other HTTP status codes as needed
        }
    } catch (error) {
        console.error("Fetch error:", error);
        result.status = API_STATUS.ERROR;
    }

    return result;
}

export async function post(url: string, data: Object, headers = defaultHeaders) {
    if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
        url = "https://" + url;
    }
    if (!url.includes("?") && !url.includes("#") && !url.endsWith("/")) {
        url += "/";
    }
    const result: APIResult = {
        data: {},
        status: 0,
    };

    try {
        const requestResult: APIResult = await fetch(url, {
            //@ts-ignore
            body: data,
            headers,
            method: "POST",
            async onResponse({ response }) {
                result.status = response.status;

                result.status = response.status;
                try {

                    result.data = response.body.json();
                } catch (error) {

                    result.data = response.body;
                }
            },
            async onResponseError({ response }) {
                result.status = response.status;
            },
        });
        result.data = requestResult;
    } catch (error) {
        result.status = API_STATUS.ERROR;
    }
    return result;
}

export async function put(url: string, data: Object, headers = defaultHeaders) {
    const result: APIResult = {
        data: {},
        status: 0,
    };
    if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
        url = "https://" + url;
    }
    if (!url.includes("?") && !url.includes("#") && !url.endsWith("/")) {
        url += "/";
    }


    try {
        const requestResult: APIResult = await fetch(url, {
            //@ts-ignore
            body: data,
            headers,
            method: "PUT",
            async onResponse({ response }) {
                result.status = response.status;
                try {

                    result.data = response.body.json();
                } catch (error) {

                    result.data = response.body;
                }
            },
            async onResponseError({ response }) {
                result.status = response.status;
            },
        });
        result.data = requestResult;
    } catch (error) {
        console.trace();
        result.status = API_STATUS.ERROR;
    }

    return result;
}
export async function patch(
    url: string,
    data: Object,
    headers = defaultHeaders
) {
    if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
        url = "https://" + url;
    }
    if (!url.includes("?") && !url.includes("#") && !url.endsWith("/")) {
        url += "/";
    }
    const result: APIResult = {
        data: {},
        status: 0,
    };
    if (!url) {
        console.trace();
    }


    try {
        const requestResult: APIResult = await fetch(url, {
            //@ts-ignore
            body: typeof data === 'object' ? JSON.stringify(data) : data,
            headers,
            method: "PATCH",
            //@ts-ignore
            async onResponse({ response }) {
                result.status = response.status;
                try {

                    result.data = response.body.json();
                } catch (error) {

                    result.data = response.body;
                }
            },
            async onResponseError({ response }) {
                result.status = response.status;
            },
        });
        result.data = requestResult;
    } catch (error) {
        result.status = API_STATUS.ERROR;
    }

    return result;
}

export async function remove(url: string, headers = defaultHeaders) {
    const result: APIResult = {
        data: {},
        status: 0,
    };

    try {
        const requestResult: APIResult = await fetch(url, {
            headers,
            method: "DELETE",
            //@ts-ignore
            async onResponse({ response }) {
                result.status = response.status;

                result.status = response.status;
                try {

                    result.data = response.body.json();
                } catch (error) {

                    result.data = response.body;
                }
            },
            async onResponseError({ response }) {
                result.status = response.status;
            },
        });
        result.data = requestResult;
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
