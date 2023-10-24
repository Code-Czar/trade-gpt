export const formatOHLCVForChartData = (data: any) => {
    if (!data) return [];
    const result: any = [];
    data.forEach((row: any) => {
        const date = new Date(row[0]);

        result.push({
            time: row[0],
            open: parseFloat(row[1]),
            high: parseFloat(row[2]),
            low: parseFloat(row[3]),
            close: parseFloat(row[4]),
            volume: parseFloat(row[5]),
        });
    });
    return result;
};

export function unixTimestampToDate(timestamp) {
    const date = new Date(timestamp * 1000); // Convert the timestamp to milliseconds

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
    const year = date.getUTCFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
}


