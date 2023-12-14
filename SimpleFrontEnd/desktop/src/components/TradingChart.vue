<template>
    <div id="trading-chart">
        <div style="display: flex; flex-direction: row">
            <h4 style="display: flex; flex-grow: 1">{{ inputSymbolData }}</h4>
            <select v-model="selectedTimeFrame" @change="() => changeActiveTimeframe()">
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="1d">1d</option>
                <option value="1w">1w</option>
                <option value="1M">1M</option>
            </select>
        </div>
        <button @click="toggleBollingerBands">
            {{ showBollingerBands.value ? 'Hide' : 'Show' }} Bollinger Bands
        </button>
        <button @click="toggleRSI">
            {{ showRSI.value ? 'Hide' : 'Show' }} RSI
        </button>
        <button @click="toggleSMA">
            {{ showSMA.value ? 'Hide' : 'Show' }} SMA
        </button>
        <button @click="toggleEMA">
            {{ showEMA.value ? 'Hide' : 'Show' }} EMA
        </button>
        <button @click="toggleVolumes">Toggle Volume</button>
        <button @click="toggleMACD">
            {{ showMACD.value ? 'Hide' : 'Show' }} MACD
        </button>
        <button @click="toggleSupport">
            {{ showSupport.value ? 'Hide' : 'Show' }} Support
        </button>
        <button @click="toggleResistance">
            {{ showResistance.value ? 'Hide' : 'Show' }} Resistance
        </button>
        <button @click="toggleRSISignals">
            {{ showRSISignals.value ? 'Hide' : 'Show' }} RSI Signals
        </button>

        <!-- <div style="min-width:150px; min-height:150px; background-color: red;"></div> -->
        <div ref="chartContainer" style="min-width: 100%; min-height: 500px"></div>
        <div v-if="showRSI" ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
        <div v-if="showVolume" ref="volumeChartContainer" style="width: 100%; height: 300px"></div>
        <!-- <div ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
        <div ref="volumeChartContainer" style="width: 100%; height: 300px"></div> -->
        <div v-if="showMACD" ref="macdChartContainer" style="width: 100%; height: 300px"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import {
    findPeaksAndTroughs,
    findRSIPeaksAndTroughs,
    identifyAndMarkReversals,
    computeEMASignals,
    indicators,
    formatOHLCVForChartData,
    STRATEGY_ANALYZER_URLS,
    apiConnector

} from 'trading-shared';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { dataStore } from '@/stores/example-store';
import { dataController } from '@/controllers';

const props = defineProps({
    inputSymbolData: {
        type: String,
        required: true,
    },
});
console.log(
    '🚀 ~ file: TradingChart.vue:56 ~ inputSymbolData:',
    props.inputSymbolData
);

let rsiSeries = null;
const showRSI = ref(false);

const toggleRSI = () => {
    showRSI.value = !showRSI.value;
};

const store = dataStore();
let candlestickChart = null;
let candlestickSeries = null;
let upperBandSeries = null;
let middleBandSeries = null;
let lowerBandSeries = null;

const chartContainer = ref(null);

let smaSeries = null;
let emaSeries = {};

const rsiChartContainer = ref(null);
let rsiChart = null;

const volumeChartContainer = ref(null);
let volumeChart = null;
let volumeSeries = null;

let macdSeries = null;
let macdHistogramSeries = null;
let macdSignalSeries = null;

const macdChartContainer = ref(null);
let macdChart = null;
const chartWidth = ref(null);
let bullishFractalSeries = null;
let bearishFractalSeries = null;
let supportLineSeries = null;
let resistanceLineSeries = null;
let bullishFractalLines = [];
let bearishFractalLines = [];
let emaMarkersSeries = null;
let uptrendLineSeries = null;
let downtrendLineSeries = null;
let rsiLevel30Series = null;
let rsiLevel70Series = null;

const showMACD = ref(true);
const showBollingerBands = ref(false);
const showSMA = ref(false);
const showEMA = ref(false);
const showVolume = ref(true);
let currentSymbolPair = await dataController.fetchSymbolData(
    props.inputSymbolData
);

const showSupport = ref(false);
const showResistance = ref(false);
const showRSISignals = ref(false);
let formattedData = null;

const selectedTimeFrame = ref('5m');
let reversalMarkers = [];
let emaMarkers = [];
let rsiMarkers = [];
let trendlineMarkers = {};
let refreshInterval = null;
let rsiUptrendLineSeries = null;
let rsiDowntrendLineSeries = null;
let bullishDivergences = [];
let bearishDivergences = [];

const updateMarkser = () => {
    candlestickSeries?.setMarkers([
        ...emaMarkers,
        ...rsiMarkers,
        ...trendlineMarkers.lowerMarkers,
        ...trendlineMarkers.higherMarkers,
    ]);
};
const drawRSITrendLines = (peaks, troughs) => {
    // Draw uptrend lines on RSI chart
    rsiUptrendLineSeries = rsiChart.addLineSeries({
        color: 'green',
        lineWidth: 2,
    });
    rsiDowntrendLineSeries = rsiChart.addLineSeries({
        color: 'red',
        lineWidth: 2,
    });

    if (troughs.length > 1) {
        const mappedTroughs = troughs.map((trough) => ({
            time: trough.time,
            value: trough.value,
        }));
        rsiUptrendLineSeries.setData(mappedTroughs);
    }

    if (peaks.length > 1) {
        const mappedPeaks = peaks.map((peak) => ({
            time: peak.time,
            value: peak.value,
        }));
        rsiDowntrendLineSeries.setData(mappedPeaks);
    }
};

const drawTrendLines = (peaks, troughs) => {
    // Example of drawing a line between two points
    // The lineSeries.setData method accepts an array of points to draw lines between
    uptrendLineSeries = candlestickChart.addLineSeries({
        color: 'green',
        lineWidth: 2,
    });
    downtrendLineSeries = candlestickChart.addLineSeries({
        color: 'red',
        lineWidth: 2,
    });

    // Here we're taking two consecutive troughs to draw an uptrend line
    trendlineMarkers = {};
    if (troughs.length > 1) {
        const mappedTroughs = troughs.map((trough) => ({
            time: trough.time,
            value: trough.low,
        }));
        uptrendLineSeries.setData(mappedTroughs);
        trendlineMarkers.lowerMarkers = identifyAndMarkReversals(
            mappedTroughs,
            'lower'
        );
    }

    // And two consecutive peaks to draw a downtrend line
    if (peaks.length > 1) {
        const mappedPeaks = peaks.map((peak) => ({
            time: peak.time,
            value: peak.high,
        }));
        downtrendLineSeries.setData(mappedPeaks);

        trendlineMarkers.higherMarkers = identifyAndMarkReversals(
            mappedPeaks,
            'upper'
        );
    }
    updateMarkser();
};

const addEMASignals = async (formattedData, ema28Data, period = 28) => {

    const result = await apiConnector.get(
        `${STRATEGY_ANALYZER_URLS.SIGNALS.getEMA28Signals}/${currentSymbolPair.details.name}`
    ); // computeEMASignals(formattedData, ema28Data, period);
    const emaSignals = (await result.data)[selectedTimeFrame.value]
        .ema28signals;
    console.log(
        '🚀 ~ file: TradingChart.vue:187 ~ addEMASignals ~ emaSignals:',
        emaSignals
    );
    if (!emaMarkersSeries) {
        emaMarkersSeries = candlestickChart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: true,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
    }
    emaMarkers = emaSignals.map((emaData) => ({
        time: emaData.time,
        position: 'belowBar',
        color: '#2196F3',
        shape: 'arrowUp',
        text: 'Buy ' + Math.floor(emaData.value - 2),
    }));
    updateMarkser();
    candlestickChart.timeScale().fitContent();
};

const addEMAFromData = async (
    emaData,
    period = 14,
    color = 'rgba(255, 0, 7, 1)'
) => {
    const convertedToSeconds = emaData.map((data) => {
        return {
            time: data.time,
            value: data.value,
        };
    });

    if (emaSeries[period]) {
        emaSeries[period].setData(convertedToSeconds);
    } else {
        emaSeries[period] = candlestickChart.addLineSeries({ color, lineWidth: 1 });
        emaSeries[period].setData(convertedToSeconds);
    }
};

const synchronizeCharts = (visibleRange) => {
    // if (!visibleRange) return;
    // const adjustVisibleRange = (chart) => {
    //     if (chart) {
    //         chart.timeScale().setVisibleRange(visibleRange);
    //     }
    // };
    // adjustVisibleRange(macdChart);
    // adjustVisibleRange(rsiChart);
    // adjustVisibleRange(volumeChart);
};

const createCandleStickChart = async () => {
    candlestickChart = createChart(chartContainer.value, {
        width: chartContainer.value.offsetWidth,
        height: chartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
        },
        rightPriceScale: {
            borderColor: '#D1D4DC',
        },
        layout: {
            background: {
                type: 'solid',
                color: '#ffffff',
            },
            textColor: '#000',
        },
        grid: {
            horzLines: {
                color: '#F0F3FA',
            },
            vertLines: {
                color: '#F0F3FA',
            },
        },
    });
    console.log(
        '🚀 ~ file: TradingChart.vue:318 ~ createCandleStickChart ~ candlestickChart:',
        candlestickChart
    );
    candlestickSeries = candlestickChart.addCandlestickSeries({
        upColor: 'rgb(38,166,154)',
        downColor: 'rgb(255,82,82)',
        wickUpColor: 'rgb(38,166,154)',
        wickDownColor: 'rgb(255,82,82)',
        borderVisible: false,
    });
    supportLineSeries = candlestickChart.addLineSeries({
        color: 'green',
        lineWidth: 3,
    });
    resistanceLineSeries = candlestickChart.addLineSeries({
        color: 'red',
        lineWidth: 3,
    });
    bullishFractalSeries = candlestickChart.addLineSeries({
        color: 'green',
        lineWidth: 1,
        lineStyle: 1,
    });
    bearishFractalSeries = candlestickChart.addLineSeries({
        color: 'red',
        lineWidth: 1,
        lineStyle: 1,
    });
};

const createRSIChart = async () => {
    rsiChart = createChart(rsiChartContainer.value, {
        width: rsiChartContainer.value.offsetWidth,
        height: rsiChartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            // timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });
    if (showRSI.value) {
    }
    rsiChart?.timeScale().subscribeVisibleTimeRangeChange(synchronizeCharts);
};
const createVolumeChart = async () => {
    volumeChart = createChart(volumeChartContainer.value, {
        width: volumeChartContainer.value.offsetWidth,
        height: volumeChartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            // timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });
    volumeSeries = volumeChart.addHistogramSeries({
        color: 'rgba(4, 232, 36, 0.8)',
        priceFormat: { type: 'volume' },
    });
    volumeChart.timeScale().subscribeVisibleTimeRangeChange(synchronizeCharts);
};
const createMACDChart = async () => {
    if (macdChartContainer.value && !macdChart) {
        // macdChartContainer.value.appendChild(macdChartElement);
        macdChart = macdChart = createChart(macdChartContainer.value, {
            width: chartWidth.value,
            height: 150,
            localization: {
                locale: 'en-US',
            },
            layout: {
                backgroundColor: '#ffffff',
                textColor: '#333',
            },
            grid: {
                vertLines: {
                    color: 'rgba(70, 130, 180, 0.5)',
                },
                horzLines: {
                    color: 'rgba(70, 130, 180, 0.5)',
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 1)',
            },
            // timeScale: {
            //     borderColor: 'rgba(197, 203, 206, 1)',
            // },
            timeScale: {
                timeVisible: true,
                // Use timeFormat to format the date as per your preference
                // timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
            },
        });
        macdChart.timeScale().subscribeVisibleTimeRangeChange(synchronizeCharts);
    } else {
        console.error('macdChartContainer is null');
    }
    window.addEventListener('resize', () => {
        chartWidth.value = window.innerWidth;
        // Also update the width of your chart
        if (macdChart) {
            macdChart.applyOptions({
                width: chartWidth.value,
                height: 150,
                localization: {
                    locale: 'en-US',
                },
                layout: {
                    backgroundColor: '#ffffff',
                    textColor: '#333',
                },
                grid: {
                    vertLines: {
                        color: 'rgba(70, 130, 180, 0.5)',
                    },
                    horzLines: {
                        color: 'rgba(70, 130, 180, 0.5)',
                    },
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                },
                rightPriceScale: {
                    borderColor: 'rgba(197, 203, 206, 1)',
                },
                timeScale: {
                    borderColor: 'rgba(197, 203, 206, 1)',
                },
            });
            macdChart.resize(chartWidth.value, 150);
        }
    });
};

const findRSIPeaksAndTroughsLocal = (data, sensitivity = 2) => {
    const peaks = [];
    const troughs = [];

    // console.log("🚀 ~ file: TradingChart.vue:493 ~ findRSIPeaksAndTroughsLocal ~ a:", data, data.length)
    if (data.length < 3) {
        return { peaks, troughs }; // Not enough data to determine peaks or troughs
    }

    let previousSlope = data[1].value - data[0].value;

    for (let i = 1; i < data.length - 1; i++) {
        let currentSlope = data[i + 1].value - data[i].value;
        // console.log("🚀 ~ file: TradingChart.vue:477 ~ findRSIPeaksAndTroughsLocal ~ currentSlope:", currentSlope)

        if (previousSlope > 0 && currentSlope < 0) {
            peaks.push(data[i]); // Peak at data[i]
        } else if (previousSlope < 0 && currentSlope > 0) {
            troughs.push(data[i]); // Trough at data[i]
        }

        previousSlope = currentSlope;
    }

    // console.log("🚀 ~ file: findRSIPeaksAndTroughsLocal.ts:30 ~ findRSIPeaksAndTroughs ~ troughs:", troughs)
    // console.log("🚀 ~ file: findRSIPeaksAndTroughsLocal.ts:30 ~ findRSIPeaksAndTroughs ~ peaks:", peaks)
    return { peaks, troughs };
};

const findClosestOhlcv = (ohlcvData, targetTime) => {
    let closest = null;
    let closestDiff = Infinity;

    for (let i = 0; i < ohlcvData.length; i++) {
        // console.log("🚀 ~ file: TradingChart.vue:497 ~ findClosestOhlcv ~ ohlcvData[i][0]:", ohlcvData[i][0], targetTime)
        if (ohlcvData[i][0] / 1000 === targetTime)
            return ohlcvData[i]

    }

    return closest;
};
const findRSIBottoms = (rsiTroughs) => {
    let rsiBottoms = [];

    for (let i = 1; i < rsiTroughs.length - 1; i++) {
        if (rsiTroughs[i].value < rsiTroughs[i - 1].value && rsiTroughs[i].value < rsiTroughs[i + 1].value) {
            rsiBottoms.push(rsiTroughs[i]);
        }
    }

    return rsiBottoms;
};

const checkBullishDivergence = (rsiTroughs, ohlcvs) => {
    let bullishDivergences = [];
    let rsiBottoms = findRSIBottoms(rsiTroughs);
    console.log("🚀 ~ file: TradingChart.vue:526 ~ checkBullishDivergence ~ rsiBottoms:", rsiBottoms)

    for (let i = 0; i < rsiBottoms.length; i++) {
        let previousBottom = rsiBottoms[i];
        let previousPriceData = findClosestOhlcv(ohlcvs, previousBottom.time);
        console.log("🚀 ~ file: TradingChart.vue:530 ~ checkBullishDivergence ~ previousBottom:", previousBottom, previousPriceData)

        for (let j = i + 1; j < rsiBottoms.length; j++) {
            let currentBottom = rsiBottoms[j];
            let currentPriceData = findClosestOhlcv(ohlcvs, currentBottom.time);

            if (previousPriceData[4] && currentPriceData[4]) {
                if (
                    currentBottom.value > previousBottom.value &&
                    currentPriceData[4] < previousPriceData[4]
                ) {
                    bullishDivergences.push({
                        previous: previousBottom,
                        current: currentBottom,
                    });
                }
            }
        }
    }

    console.log(
        '🚀 ~ file: TradingChart.vue:526 ~ checkBullishDivergence ~ bullishDivergences:',
        bullishDivergences
    );
    return bullishDivergences;
};



const checkBearishDivergence = (pricePeaks, rsiTroughs) => {
    // Check for bearish divergence
    bearishDivergences = [];
    for (let i = 0; i < pricePeaks.length; i++) {
        let pricePeak = pricePeaks[i];
        for (let j = 0; j < rsiTroughs.length; j++) {
            let rsiTrough = rsiTroughs[j];
            // console.log(
            //     '🚀 ~ file: TradingChart.vue:521 ~ checkBearishDivergence ~ rsiTrough:',
            //     rsiTrough
            // );
            if (
                rsiTrough.time > pricePeak.time &&
                rsiTrough?.value < rsiTroughs[j - 1]?.value
            ) {
                bearishDivergences.push({
                    pricePeak,
                    rsiTrough,
                    number: bearishDivergences.length,
                });
                break;
            }
        }
    }
    return bearishDivergences;
};

const updateData = async (symbolPairData) => {
    if (!symbolPairData) return;

    const seriesValues = symbolPairData.ohlcvs[selectedTimeFrame.value];
    // console.log(
    //     '🚀 ~ file: TradingChart.vue:481 ~ updateData ~ seriesValues:',
    //     seriesValues
    // );
    const firstSerie = seriesValues;
    if (!firstSerie || !candlestickChart) return;

    formattedData = await formatOHLCVForChartData(firstSerie);
    return formattedData;
    // formattedData = formattedData.reverse()
};

const updateChartsFromPair = async (symbolPairData = currentSymbolPair) => {
    const formatted = await updateData(symbolPairData);
    // console.log(
    //     '🚀 ~ file: TradingChart.vue:491 ~ updateChartsFromPair ~ formatted:',
    //     symbolPairData,
    //     formatted
    // );
    if (!symbolPairData?.ohlcvs?.[selectedTimeFrame.value]) return;
    let pricePeaks = null;
    let priceTroughs = null;
    if (candlestickSeries) {
        if (uptrendLineSeries) {
            candlestickChart?.removeSeries(uptrendLineSeries);
        }
        if (downtrendLineSeries) {
            candlestickChart?.removeSeries(downtrendLineSeries);
        }
        // const duplicate = [
        //     ...symbolPairData.ohlcvs[selectedTimeFrame.value],
        // ];
        // const sorted = sortDataAscending(duplicate)

        let formatted1 = await formatOHLCVForChartData(
            symbolPairData.ohlcvs[selectedTimeFrame.value]
        );
        candlestickSeries.setData(formatted1);
        const { peaks, troughs } = findPeaksAndTroughs(formatted1);
        pricePeaks = peaks;
        priceTroughs = troughs;
        drawTrendLines(pricePeaks, priceTroughs);
    }
    if (showBollingerBands.value) {
        const { upperBand, lowerBand, middleBand } =
            symbolPairData.bollingerBands[selectedTimeFrame.value];

        const upperConvertedToSeconds = upperBand.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });
        const lowerBandConvertedToSeconds = lowerBand.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });
        const middleBandConvertedToSeconds = middleBand.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });
        if (upperBandSeries) {
            upperBandSeries.setData(upperConvertedToSeconds);
        } else {
            upperBandSeries = candlestickChart.addLineSeries({
                color: 'rgba(4, 111, 232, 1)',
                lineWidth: 1,
            });
            upperBandSeries.setData(upperBand);
        }

        if (middleBandSeries) {
            middleBandSeries.setData(middleBandConvertedToSeconds);
        } else {
            middleBandSeries = candlestickChart.addLineSeries({
                color: '#2c3e50',
                lineWidth: 1,
            });
            middleBandSeries.setData(middleBandConvertedToSeconds);
        }

        if (lowerBandSeries) {
            lowerBandSeries.setData(lowerBandConvertedToSeconds);
        } else {
            lowerBandSeries = candlestickChart.addLineSeries({
                color: 'rgba(4, 111, 232, 1)',
                lineWidth: 1,
            });
            lowerBandSeries.setData(lowerBandConvertedToSeconds);
        }
    } else {
        if (upperBandSeries) {
            candlestickChart.removeSeries(upperBandSeries);
            upperBandSeries = null;
        }

        if (middleBandSeries) {
            candlestickChart.removeSeries(middleBandSeries);
            middleBandSeries = null;
        }

        if (lowerBandSeries) {
            candlestickChart.removeSeries(lowerBandSeries);
            lowerBandSeries = null;
        }
    }

    if (showRSI.value) {
        if (!rsiChart) {
            await createRSIChart();
        }
        const rsiData = symbolPairData.rsi[selectedTimeFrame.value].rsiData;
        const rsiDataConvertedToSeconds = rsiData.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });

        if (rsiSeries) {
            rsiSeries.setData(rsiDataConvertedToSeconds);
            const rsiData = symbolPairData.rsi[selectedTimeFrame.value].rsiData;
            console.log(
                '🚀 ~ file: TradingChart.vue:337 ~ createRSIChart ~ rsiData:',
                rsiData
            );

            if (rsiData && rsiData.length > 0) {
                const startTime = rsiData[0].time;
                const endTime = rsiData[rsiData.length - 1].time;

                const rsiLevel70Series = rsiChart.addLineSeries({
                    color: 'rgba(255, 0, 0, 1)', // Red color for the 70 level
                    lineWidth: 1,
                });

                const rsiLevel30Series = rsiChart.addLineSeries({
                    color: 'rgba(0, 255, 0, 1)', // Green color for the 30 level
                    lineWidth: 1,
                });

                rsiLevel70Series.setData([
                    { time: startTime, value: 70 },
                    { time: endTime, value: 70 },
                ]);

                rsiLevel30Series.setData([
                    { time: startTime, value: 30 },
                    { time: endTime, value: 30 },
                ]);
            }

            const { peaks: rsiPeaks, troughs: rsiTroughs } =
                findRSIPeaksAndTroughsLocal(rsiDataConvertedToSeconds);
            console.log(
                '🚀 ~ file: TradingChart.vue:618 ~ updateChartsFromPair ~ troughs:',
                rsiTroughs
            );
            console.log(
                '🚀 ~ file: TradingChart.vue:618 ~ updateChartsFromPair ~ peaks:',
                rsiPeaks
            );

            console.log(
                '🚀 ~ file: TradingChart.vue:691 ~ updateChartsFromPair ~ Price peaks troughs:',
                pricePeaks,
                priceTroughs
            );

            bearishDivergences = checkBearishDivergence(pricePeaks, rsiTroughs);
            bullishDivergences = checkBullishDivergence(
                rsiTroughs,
                symbolPairData?.ohlcvs?.[selectedTimeFrame.value]
            );
            if (bullishDivergences && bullishDivergences.length > 0) {
                // const bullishSeries = rsiChart.addLineSeries({
                //     color: 'orange',
                //     lineWidth: 2
                // });

                // And you have your divergence pairs in a variable called `divergencePairs`
                const bullishSeries = []
                bullishDivergences.forEach(pair => {
                    const newSerie = rsiChart.addLineSeries({
                        color: 'orange',
                        lineWidth: 2
                    });
                    newSerie.setData([{
                        time: pair.previous.time,
                        value: pair.previous.value
                    }, {
                        time: pair.current.time,
                        value: pair.current.value
                    }]);
                    bullishSeries.push(newSerie);
                    // bullishSeries.createLine({
                    //     x1: pair.previous.time,
                    //     y1: pair.previous.value,
                    //     x2: pair.current.time,
                    //     y2: pair.current.value,
                    //     color: 'orange',
                    //     width: 2
                    // });
                });

                // bullishDivergences = bullishDivergences.map((item) => {
                //     return {
                //         time: item.priceTrough.time,
                //         position: 'belowBar',
                //         color: 'orange',
                //         shape: 'arrowUp',
                //         text: 'Divergence ' + item.number,
                //     };
                // });
                // updateMarkser();
            }
            console.log(
                '🚀 ~ file: TradingChart.vue:691 ~ updateChartsFromPair ~ bearishDivergences:',
                bullishDivergences,
                bearishDivergences
            );

            drawRSITrendLines(rsiPeaks, rsiTroughs);
        } else {
            rsiSeries = rsiChart.addLineSeries({
                color: 'rgba(4, 232, 36, 1)',
                lineWidth: 1,
            });
            rsiSeries.setData(rsiDataConvertedToSeconds);
        }
    } else {
        if (rsiSeries) {
            rsiChart.removeSeries(rsiSeries);
            rsiSeries = null;
        }
    }

    if (showSMA.value) {
        if (!macdChart) {
            await createMACDChart();
        }
        const smaData = symbolPairData.sma[selectedTimeFrame.value].smaData;
        if (smaSeries) {
            smaSeries.setData(smaData);
        } else {
            smaSeries = candlestickChart.addLineSeries({
                color: 'rgba(0, 255, 255, 1)',
                lineWidth: 1,
            });
            smaSeries.setData(smaData);
        }
    } else {
        if (smaSeries) {
            candlestickChart.removeSeries(smaSeries);
            smaSeries = null;
        }
    }

    if (showEMA.value) {
        const EMA_COLORS = {
            ema7: '#f1c40f',
            ema14: '#2980b9',
            ema28: '#8e44ad',
        };
        addEMAFromData(
            symbolPairData.ema[selectedTimeFrame.value].ema7,
            7,
            EMA_COLORS.ema7
        );
        addEMAFromData(
            symbolPairData.ema[selectedTimeFrame.value].ema14,
            14,
            EMA_COLORS.ema14
        );
        addEMAFromData(
            symbolPairData.ema[selectedTimeFrame.value].ema28,
            28,
            EMA_COLORS.ema28
        );
        if (emaMarkers.length === 0) {
            const ema28Data = currentSymbolPair.ema[selectedTimeFrame.value].ema28; // Replace with actual EMA 28 data
            addEMASignals(formattedData, ema28Data);
            updateMarkser();
        }
    } else {
        const series = Object.values(emaSeries);
        if (series.length > 0) {
            series.forEach((emaSerie) => {
                candlestickChart.removeSeries(emaSerie);
            });
            emaSeries = {};
        }
        emaMarkers = [];
        updateMarkser();
    }

    if (showVolume.value) {
        if (!volumeChart && volumeChartContainer.value) {
            await createVolumeChart();
        }
        const volumeData = symbolPairData.volumes[selectedTimeFrame.value];
        const duplicate = [...volumeData];
        // const sorted = sortDataAscending(duplicate)
        volumeSeries?.setData(duplicate);
    } else {
        volumeSeries?.setData([]); // set data to an empty array to clear the volume data
    }

    if (showMACD.value) {
        if (!macdChart && macdChartContainer.value) {
            await createMACDChart();
        }
        const { macdData, signalData, histogramData } =
            symbolPairData.macd[selectedTimeFrame.value];
        // console.log(
        //     '🚀 ~ file: TradingChart.vue:645 ~ updateChartsFromPair ~ histogramData:',
        //     histogramData
        // );
        // console.log(
        //     '🚀 ~ file: TradingChart.vue:645 ~ updateChartsFromPair ~ signalData:',
        //     signalData
        // );
        // console.log(
        //     '🚀 ~ file: TradingChart.vue:645 ~ updateChartsFromPair ~ macdData:',
        //     macdData
        // );
        const macdDataConvertedToSeconds = macdData.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });
        const signalDataConvertedToSeconds = signalData.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });
        const histogramDataConvertedToSeconds = histogramData.map((data) => {
            return {
                time: data.time,
                value: data.value,
            };
        });

        if (macdSeries) {
            macdSeries.setData(macdDataConvertedToSeconds);
        } else {
            macdSeries = macdChart?.addLineSeries({
                color: 'rgba(4, 232, 36, 1)',
                lineWidth: 1,
            });
            macdSeries?.setData(macdDataConvertedToSeconds);
        }

        if (macdSignalSeries) {
            macdSignalSeries.setData(signalDataConvertedToSeconds);
        } else {
            macdSignalSeries = macdChart?.addLineSeries({
                color: 'rgba(0, 123, 255, 1)',
                lineWidth: 1,
            });
            macdSignalSeries?.setData(signalDataConvertedToSeconds);
        }

        if (macdHistogramSeries) {
            macdHistogramSeries?.setData(histogramDataConvertedToSeconds);
        } else {
            macdHistogramSeries = macdChart?.addHistogramSeries({
                color: 'rgba(255, 193, 7, 0.8)',
                priceFormat: { type: 'volume' },
            });
            macdHistogramSeries?.setData(histogramDataConvertedToSeconds);
        }
    } else {
        if (macdSeries) {
            macdChart.removeSeries(macdSeries);
            macdSeries = null;
        }

        if (macdSignalSeries) {
            macdChart.removeSeries(macdSignalSeries);
            macdSignalSeries = null;
        }

        if (macdHistogramSeries) {
            macdChart.removeSeries(macdHistogramSeries);
            macdHistogramSeries = null;
        }
    }

    // const firstTimeValue = formattedData[0].time;
    if (showSupport.value || showResistance.value) {
        const { bullishFractals, bearishFractals } =
            indicators.findFractals(formattedData);

        // Removing old fractal lines
        bullishFractalLines.forEach((line) => candlestickChart.removeSeries(line));
        bearishFractalLines.forEach((line) => candlestickChart.removeSeries(line));

        bullishFractalLines = [];
        bearishFractalLines = [];

        // Adding new fractal lines
        bullishFractals.forEach((fractal) => {
            const line = candlestickChart.addLineSeries({
                color: 'green',
                lineWidth: 1,
                lineStyle: 0, // Solid line
            });
            line.setData([
                { time: fractal.time, value: fractal.value },
                {
                    time: formattedData[formattedData.length - 1].time,
                    value: fractal.value,
                },
            ]);
            bullishFractalLines.push(line);
        });

        bearishFractals.forEach((fractal) => {
            const line = candlestickChart.addLineSeries({
                color: 'red',
                lineWidth: 1,
                lineStyle: 0, // Solid line
            });
            line.setData([
                { time: fractal.time, value: fractal.value },
                {
                    time: formattedData[formattedData.length - 1].time,
                    value: fractal.value,
                },
            ]);
            bearishFractalLines.push(line);
        });
    } else {
        bullishFractalLines.forEach((line) => line.setData([]));
        bearishFractalLines.forEach((line) => line.setData([]));
    }
};

watchEffect(async () => {
    // if (store.pairs.size === 0) return;
    // currentSymbolPair = props.inputSymbolData;
    // if (!currentSymbolPair) return;

    // await updateData(currentSymbolPair);
    await updateChartsFromPair();
});

const toggleSupport = () => {
    showSupport.value = !showSupport.value;
    updateChartsFromPair();
};

const toggleResistance = () => {
    showResistance.value = !showResistance.value;
};

const toggleSMA = () => {
    showSMA.value = !showSMA.value;
    updateChartsFromPair();
};

const toggleEMA = () => {
    showEMA.value = !showEMA.value;

    updateChartsFromPair();
};

const toggleBollingerBands = () => {
    showBollingerBands.value = !showBollingerBands.value;
    updateChartsFromPair();
};

const toggleVolumes = () => {
    showVolume.value = !showVolume.value;
    updateChartsFromPair();
};

const toggleMACD = () => {
    showMACD.value = !showMACD.value;
    updateChartsFromPair();
};

const toggleRSISignals = async () => {
    showRSISignals.value = !showRSISignals.value;
    if (showRSISignals.value) {
        const response = await apiConnector.get(
            `${STRATEGY_ANALYZER_URLS.SIGNALS.getRSISignals}/${currentSymbolPair.details.name}`
        );
        const RSISignals = await response.data;
        const RSISignalsTimeframe = RSISignals[selectedTimeFrame.value];
        console.log(
            '🚀 ~ file: TradingChart.vue:818 ~ toggleRSISignals ~ RSISignals:',
            RSISignals
        );

        if (RSISignalsTimeframe) {
            rsiMarkers = [];
            updateMarkser();

            rsiMarkers = Object.entries(RSISignalsTimeframe).map(
                ([time, rsiData]) => ({
                    time: parseFloat(time),
                    position: 'belowBar',
                    color: 'green',
                    shape: 'arrowUp',
                    text: 'RSI Buy ' + rsiData,
                })
            );

            updateMarkser();
            // updateChartsFromPair();
        }
    } else {
        rsiMarkers = [];
        updateMarkser();
    }
};

const changeActiveTimeframe = () => {
    emaMarkers = [];
    console.log(
        '🚀 ~ file: TradingChart.vue:812 ~ changeActiveTimeframe ~ changeActiveTimeframe:',
        changeActiveTimeframe
    );
    updateMarkser();

    updateChartsFromPair();
};

onMounted(async () => {
    console.log(
        '🚀 ~ file: TradingChart.vue:809 ~ onMounted ~ onMounted:',
        onMounted
    );
    chartWidth.value = window.innerWidth;
    // let macdChartElement = document.createElement('div');
    await createCandleStickChart();
    // candlestickChart?.timeScale().subscribeVisibleTimeRangeChange((visibleRange) => {
    //     if (visibleRange) {
    //         synchronizeCharts(visibleRange);
    //     }
    // });
    candlestickChart
        ?.timeScale()
        .subscribeVisibleTimeRangeChange(synchronizeCharts);
    // volumeChart?.timeScale().subscribeVisibleTimeRangeChange(synchronizeCharts);
    // rsiChart?.timeScale().subscribeVisibleTimeRangeChange(synchronizeCharts);
    // macdChart?.timeScale().subscribeVisibleTimeRangeChange(synchronizeCharts);

    refreshInterval = setInterval(async () => {
        currentSymbolPair = await dataController.fetchSymbolData(
            props.inputSymbolData
        );
        await updateChartsFromPair();
    }, 1000 * 2);
});

onUnmounted(() => {
    if (candlestickChart) {
        candlestickChart.remove();
        candlestickChart = null;
    }
    if (macdChart) {
        macdChart.remove();
        macdChart = null;
    }
    if (volumeChart) {
        volumeChart.remove();
        volumeChart = null;
    }
    if (rsiChart) {
        rsiChart.remove();
        rsiChart = null;
    }
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
});
</script>
