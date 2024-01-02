export const formatOHLCVForChartData = (data: any, pairName: string | null = null, timeframe: string | null = null) => {
  if (!data) return [];
  // Sort the data array in ascending order by timestamp (assuming the timestamp is the first element in each row)
  const sortedData = data.sort((a: any, b: any) => a[0] - b[0]);

  const result: any = [];
  sortedData.forEach((row: any) => {
    const date = new Date(row[0]);

    result.push({
      time: row[0],
      pairName,
      timeframe,
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

export function extractRSIData(results) {
  const rsiData = results.filter((item) => item.key === 'rsiData');
  const rsiDataResult = {};
  rsiData.forEach((item) => {
    if (!rsiDataResult[item.timeframe]) {
      rsiDataResult[item.timeframe] = {};
    }
    const time = new Date(item._time).getTime();
    if (!rsiDataResult[item.timeframe]['risData']) {
      rsiDataResult[item.timeframe]['rsiData'] = [];
    }
    rsiDataResult[item.timeframe]['rsiData'].push({
      time,
      value: item._value,
    });
  });
  return rsiDataResult;
}
