// Function to check if the server is up and running
export async function waitForServerToBeReady(url, maxRetries = 5) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await request.get(url).expect(200);
            return; // Server is ready, exit the function
        } catch (error) {
            retries++;
            console.log(`Waiting for server to be ready... Attempt ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        }
    }

    throw new Error('Server did not become ready in time');
}

export default {
    waitForServerToBeReady
}