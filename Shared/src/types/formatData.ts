export const formatOHLCVForChartData = (data: any) => {
    if (!data) return [];
    const result: any = [];
    data.forEach((row: any) => {
        const date = new Date(row[0]);

        result.push({
            time: row[0] / 1000,
            open: parseFloat(row[1]),
            high: parseFloat(row[2]),
            low: parseFloat(row[3]),
            close: parseFloat(row[4]),
            volume: parseFloat(row[5]),
        });
    });
    return result;
};