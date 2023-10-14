const promiseLimiter = (maxConcurrent, tasks) => {
    let numRunning = 0;
    let taskIndex = 0;

    return new Promise((resolve) => {
        const results = new Array(tasks.length);
        const checkNext = () => {
            if (taskIndex === tasks.length && numRunning === 0) {
                resolve(results); // All tasks are done
            } else if (taskIndex < tasks.length) {
                numRunning++;
                tasks[taskIndex]().then((result) => {
                    results[taskIndex] = result;
                    numRunning--;
                    checkNext();
                });
                taskIndex++;
                while (numRunning < maxConcurrent && taskIndex < tasks.length) {
                    checkNext(); // Start new tasks
                }
            }
        };
        checkNext(); // Start the first task(s)
    });
}

export default promiseLimiter;


