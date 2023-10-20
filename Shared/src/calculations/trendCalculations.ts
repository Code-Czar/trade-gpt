export const findPeaksAndTroughs = (data: any) => {
    const peaks: any = [];
    const troughs: any = [];
    for (let i = 1; i < data.length - 1; i++) {
        if (data[i].high > data[i - 1].high && data[i].high > data[i + 1].high) {
            peaks.push(data[i]);
        } else if (data[i].low < data[i - 1].low && data[i].low < data[i + 1].low) {
            troughs.push(data[i]);
        }
    }
    peaks.push(data[data.length - 1]);
    troughs.push(data[data.length - 1]);
    return { peaks, troughs };
};

export const calculateSlope = (point1: any, point2: any) => {
    return (point2.value - point1.value) / (point2.time - point1.time);
};

export const identifyAndMarkReversals = (points: any, trendBand = 'upper') => {
    if (points.length < 3) return; // Need at least 3 points to identify a reversal
    const reversalMarkers: any = [];

    for (let i = 1; i < points.length - 1; i++) {
        const slope1 = calculateSlope(points[i - 1], points[i]);
        const slope2 = calculateSlope(points[i], points[i + 1]);

        // Check for reversal
        if (Math.sign(slope1) !== Math.sign(slope2)) {
            // Reversal found, add marker
            if (trendBand === 'upper') {
                reversalMarkers.push({
                    time: points[i].time,
                    position: 'aboveBar',
                    color: 'rgba(255, 0, 0, 1)',
                    shape: 'circle',
                    text: 'R - upper',
                });
            } else if (trendBand === 'lower') {
                reversalMarkers.push({
                    time: points[i].time,
                    position: 'belowBar',
                    color: 'rgba(0, 0, 255, 1)',
                    shape: 'circle',
                    text: 'R - lower',
                });
            }
        }
    }
    return reversalMarkers;
};

export const computeEMASignals = (formattedData: any, ema28Data: any, period: number = 28) => {
    const emaSignals: any = [];
    const emaData = ema28Data; //.map((value, index) => ({ time: formattedData[index + period - 1].time, value: value.value }));
    formattedData.forEach((dataPoint: any, index: any) => {
        if (index < period - 1) return;

        if (dataPoint.close < emaData[index - period + 1].value) {
            emaSignals.push({
                time: dataPoint.time,
                value: dataPoint.low,
                color: 'rgba(255, 0, 0, 1)',
            });
        }
    });

    return emaSignals;
};

