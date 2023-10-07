<template>
    <div id="trading-chart">

        <h4>{{ inputSymbol }}</h4>
        <button @click="toggleBollingerBands">{{ showBollingerBands.value ? 'Hide' : 'Show' }} Bollinger Bands</button>
        <button @click="toggleRSI">{{ showRSI.value ? 'Hide' : 'Show' }} RSI</button>
        <button @click="toggleSMA">{{ showSMA.value ? 'Hide' : 'Show' }} SMA</button>
        <button @click="toggleEMA">{{ showEMA.value ? 'Hide' : 'Show' }} EMA</button>
        <button @click="toggleVolumes">Toggle Volume</button>
        <button @click="toggleMACD">{{ showMACD.value ? 'Hide' : 'Show' }} MACD</button>
        <button @click="toggleSupport">{{ showSupport.value ? 'Hide' : 'Show' }} Support</button>
        <button @click="toggleResistance">{{ showResistance.value ? 'Hide' : 'Show' }} Resistance</button>
        <select v-model="selectedTimeFrame">
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
        <div ref="chartContainer" style="width: 100%; height: 500px"></div>
        <!-- <div v-show="showRSI" ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
        <div v-show="showVolume" ref="volumeChartContainer" style="width: 100%; height: 300px"></div> -->
        <div ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
        <div ref="volumeChartContainer" style="width: 100%; height: 300px"></div>
        <div ref="macdChartContainer" style="width: 100%; height: 300px"></div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { dataStore } from '@/stores/example-store';
import { SMA, EMA, RSI, MACD } from 'technicalindicators';

const props = defineProps({
    inputSymbol: {
        type: String,
        required: true,
    },
});

let rsiSeries = null;
const showRSI = ref(false);

const toggleRSI = () => {
    showRSI.value = !showRSI.value;
};

const store = dataStore();
let chart = null;
let candlestickSeries = null;
let upperBandSeries = null;
let middleBandSeries = null;
let lowerBandSeries = null;
const showVolume = ref(false);

const chartContainer = ref(null);

const showBollingerBands = ref(true);

let smaSeries = null;
let emaSeries = {};
const showSMA = ref(false);
const showEMA = ref(false);

const rsiChartContainer = ref(null);
let rsiChart = null;

const volumeChartContainer = ref(null);
let volumeChart = null;
let volumeSeries = null;

let macdSeries = null;
let macdHistogramSeries = null;
let macdSignalSeries = null;
const showMACD = ref(false);

const macdChartContainer = ref(null);
let macdChart = null;
const chartWidth = ref(null);

// const supportData = store.supportData[0];
// const resistanceData = store.resistanceData[0];
let supportLineSeries;
let resistanceLineSeries;
let supportLine;
let resistanceLine;

const showSupport = ref(false);
const showResistance = ref(false);

const selectedTimeFrame = ref('5m');
const toggleSupport = () => {
    showSupport.value = !showSupport.value;
};

const toggleResistance = () => {
    showResistance.value = !showResistance.value;
};


const toggleSMA = () => {
    showSMA.value = !showSMA.value;
};

const toggleEMA = () => {
    showEMA.value = !showEMA.value;
};

const toggleBollingerBands = () => {
    showBollingerBands.value = !showBollingerBands.value;
};

const toggleVolumes = () => {
    showVolume.value = !showVolume.value;
    // console.log('🚀 ~ file: TradingChart.vue:66 ~ toggleVolumes ~ showVolume.value:', showVolume.value);
};

const toggleMACD = () => {
    showMACD.value = !showMACD.value;
};
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const addEMA = (formattedData, period = 14, color = 'rgba(255, 0, 7, 1)') => {
    let inputEMA7 = {
        values: formattedData.map((data) => data.close),
        period: period,
    };
    let ema = EMA.calculate(inputEMA7);

    let emaData = ema.map((value, index) => ({ time: formattedData[index + inputEMA7.period - 1].time, value: value }));

    if (emaSeries[period]) {
        emaSeries[period].setData(emaData);
    } else {
        emaSeries[period] = chart.addLineSeries({ color, lineWidth: 1 });
        emaSeries[period].setData(emaData);
    }
}

const formatChartData = (data) => {
    if (!data) return [];
    console.log("🚀 ~ file: TradingChart.vue:103 ~ formatChartData ~ data:", data)
    const result = []
    data.forEach((row) => {
        result.push({
            time: row[0],
            // time: formatDateToYYYYMMDD(new Date(row[0])),
            open: parseFloat(row[1]),
            high: parseFloat(row[2]),
            low: parseFloat(row[3]),
            close: parseFloat(row[4]),
            volume: parseFloat(row[5]),
        })

    })

    console.log("🚀 ~ file: TradingChart.vue:141 ~ formatChartData ~ result:", result)
    return result;
};

const sma = (arr, windowSize) => {
    let result = [];
    for (let i = windowSize - 1; i < arr.length; i++) {
        const window = arr.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((sum, num) => sum + num, 0) / windowSize;
        result.push(average);
    }
    return result;
};

const standardDeviation = (arr, windowSize, smaValues) => {
    let result = [];
    for (let i = windowSize - 1; i < arr.length; i++) {
        const window = arr.slice(i - windowSize + 1, i + 1);
        const variance =
            window.reduce((sum, num) => sum + Math.pow(num - smaValues[i - windowSize + 1], 2), 0) / windowSize;
        result.push(Math.sqrt(variance));
    }
    return result;
};

watchEffect(async () => {
    // const newDataValues = Object.values(store.data);
    // const newData = newDataValues[newDataValues.length - 1];
    // if (!newData) return;
    if (store.pairs.size === 0) return;
    // const pairs = Array.from(store.pairs);
    const symbolPair = store.pairs.get(props.inputSymbol)
    console.log("🚀 ~ file: TradingChart.vue:144 ~ watchEffect ~ APEUSDT:", symbolPair)
    const seriesValues = symbolPair.ohlcvs[selectedTimeFrame.value];
    console.log("🚀 ~ file: TradingChart.vue:144 ~ watchEffect ~ seriesValues:", seriesValues)
    const firstSerie = seriesValues;
    if (!firstSerie || !chart) return;
    // console.log('🚀 ~ file: TradingChart.vue:26 ~ watch ~ newData:', firstSerie);

    let formattedData = formatChartData(firstSerie);

    console.log('🚀 ~ file: TradingChart.vue:108 ~ watchEffect ~ formattedData:', formattedData);
    if (candlestickSeries) {

        candlestickSeries.setData(formattedData);

    }
    if (showBollingerBands.value) {
        const closePrices = formattedData.map((datum) => datum.close);
        const sma20 = sma(closePrices, 20);
        const stdDev20 = standardDeviation(closePrices, 20, sma20);

        const upperBand = sma20.map((value, index) => ({
            time: formattedData[index + 19].time,
            value: value + 2 * stdDev20[index],
        }));
        const middleBand = sma20.map((value, index) => ({ time: formattedData[index + 19].time, value }));
        const lowerBand = sma20.map((value, index) => ({
            time: formattedData[index + 19].time,
            value: value - 2 * stdDev20[index],
        }));

        if (upperBandSeries) {
            upperBandSeries.setData(upperBand);
        } else {
            upperBandSeries = chart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
            upperBandSeries.setData(upperBand);
        }

        if (middleBandSeries) {
            middleBandSeries.setData(middleBand);
        } else {
            middleBandSeries = chart.addLineSeries({ color: '#2c3e50', lineWidth: 1 });
            middleBandSeries.setData(middleBand);
        }

        if (lowerBandSeries) {
            lowerBandSeries.setData(lowerBand);
        } else {
            lowerBandSeries = chart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
            lowerBandSeries.setData(lowerBand);
        }
    } else {
        if (upperBandSeries) {
            chart.removeSeries(upperBandSeries);
            upperBandSeries = null;
        }

        if (middleBandSeries) {
            chart.removeSeries(middleBandSeries);
            middleBandSeries = null;
        }

        if (lowerBandSeries) {
            chart.removeSeries(lowerBandSeries);
            lowerBandSeries = null;
        }
    }

    if (showRSI.value) {
        let inputRSI = {
            values: formattedData.map((data) => data.close),
            period: 14,
        };
        let rsi = RSI.calculate(inputRSI);

        let rsiData = rsi.map((value, index) => ({ time: formattedData[index + inputRSI.period - 1].time, value: value }));

        if (rsiSeries) {
            rsiSeries.setData(rsiData);
        } else {
            rsiSeries = rsiChart.addLineSeries({ color: 'rgba(4, 232, 36, 1)', lineWidth: 1 });
            rsiSeries.setData(rsiData);
        }
    } else {
        if (rsiSeries) {
            rsiChart.removeSeries(rsiSeries);
            rsiSeries = null;
        }
    }

    if (showSMA.value) {
        let inputSMA = {
            values: formattedData.map((data) => data.close),
            period: 200,
        };
        let sma = SMA.calculate(inputSMA);

        let smaData = sma.map((value, index) => ({ time: formattedData[index + inputSMA.period - 1].time, value: value }));

        if (smaSeries) {
            smaSeries.setData(smaData);
        } else {
            smaSeries = chart.addLineSeries({ color: 'rgba(0, 255, 255, 1)', lineWidth: 1 });
            smaSeries.setData(smaData);
        }
    } else {
        if (smaSeries) {
            chart.removeSeries(smaSeries);
            smaSeries = null;
        }
    }

    if (showEMA.value) {
        addEMA(formattedData, 7, '#f1c40f')
        addEMA(formattedData, 14, '#2980b9')
        addEMA(formattedData, 28, '#8e44ad')

    } else {
        const series = Object.values(emaSeries)
        if (series.length > 0) {
            series.forEach((emaSerie) => {

                chart.removeSeries(emaSerie);
            })
            emaSeries = {};
        }
    }

    if (showVolume.value) {
        let volumeData = formattedData.map((data) => ({
            time: data.time / 1000,
            value: data.volume,
            color: data.open > data.close ? 'rgba(255, 82, 82, 0.8)' : 'rgba(4, 232, 36, 0.8)',
        }));
        // console.log('🚀 ~ file: TradingChart.vue:250 ~ watchEffect ~ volumeData:', volumeData);
        volumeSeries.setData(volumeData);
    } else {
        volumeSeries.setData([]); // set data to an empty array to clear the volume data
    }

    if (showMACD.value) {
        let inputMACD = {
            values: formattedData.map((data) => data.close),
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };
        let macd = MACD.calculate(inputMACD);
        // console.log("🚀 ~ file: TradingChart.vue:270 ~ watchEffect ~ macd:", macd, inputMACD)

        let macdData = macd.map((value, index) => {
            const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
            if (!formattedData[period]) return;
            return {
                time: formattedData[period]?.time,
                value: value.MACD,
            }
        });
        macdData = macdData.filter((value) => value !== undefined);
        let signalData = macd.map((value, index) => {
            const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
            if (!formattedData[period]) return;
            return {
                time: formattedData[index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2]?.time,
                value: value.signal,
            }
        });
        signalData = signalData.filter((value) => value !== undefined);

        let histogramData = macd.map((value, index) => {
            const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
            if (!formattedData[period]) return;
            return {
                time: formattedData[index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2]?.time,
                value: value.histogram,
            }
        });
        histogramData = histogramData.filter((value) => value !== undefined);

        if (macdSeries) {
            macdSeries.setData(macdData);
        } else {
            macdSeries = macdChart.addLineSeries({ color: 'rgba(4, 232, 36, 1)', lineWidth: 1 });
            macdSeries.setData(macdData);
        }

        if (macdSignalSeries) {
            macdSignalSeries.setData(signalData);
        } else {
            macdSignalSeries = macdChart.addLineSeries({ color: 'rgba(0, 123, 255, 1)', lineWidth: 1 });
            macdSignalSeries.setData(signalData);
        }

        if (macdHistogramSeries) {
            macdHistogramSeries.setData(histogramData);
        } else {
            macdHistogramSeries = macdChart.addHistogramSeries({
                color: 'rgba(255, 193, 7, 0.8)',
                priceFormat: { type: 'volume' },
            });
            macdHistogramSeries.setData(histogramData);
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

    const firstTimeValue = formattedData[0].time;
    if (showSupport.value) {


        // if (supportLine) {
        //     supportLine.setData([{ time: formattedData[0].time / 1000, value: supportData }, { time: formattedData[formattedData.length - 1].time / 1000, value: supportData }]);
        // } else {
        //     supportLine = chart.addLineSeries({ color: 'green', lineWidth: 20 });
        //     supportLine.setData([{ time: formattedData[0].time / 1000, value: supportData }, { time: formattedData[formattedData.length - 1].time / 1000, value: supportData }]);
        // }

        store.supportData.forEach((support) => {
            // console.log("🚀 ~ file: TradingChart.vue:398 ~ store.resistanceData.forEach ~ support:", support[4])

            const supportLineData = formattedData.map((value) => ({
                time: value.time,
                value: Object.values(support)[3],
                color: 'green',
                lineWidth: 2,
            }));
            supportLineSeries.setData(supportLineData);
        })


    } else {

    }

    if (showResistance.value) {


        // console.log("🚀 ~ file: TradingChart.vue:399 ~ store.resistanceData.resistance.forEach ~ store.resistanceData:", store.resistanceData)
        store.resistanceData.forEach((resistance) => {
            // console.log("🚀 ~ file: TradingChart.vue:398 ~ store.resistanceData.forEach ~ resistance:", resistance[4])

            const resistanceLineData = formattedData.map((value) => ({
                time: value.time,
                value: Object.values(resistance)[3],
                color: 'red',
                lineWidth: 2,
            }));;
            resistanceLineSeries.setData(resistanceLineData);
        })

    } else {
        // if (resistanceLine) {
        //     chart.removeSeries(resistanceLine);
        //     resistanceLine = null;
        // }
    }

});

onMounted(async () => {
    chartWidth.value = window.innerWidth;
    // let macdChartElement = document.createElement('div');
    if (macdChartContainer.value) {
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
                timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
            },
        });
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
    chart = createChart(chartContainer.value, {
        width: chartContainer.value.offsetWidth,
        height: chartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });
    rsiChart = createChart(rsiChartContainer.value, {
        width: rsiChartContainer.value.offsetWidth,
        height: rsiChartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });

    volumeChart = createChart(volumeChartContainer.value, {
        width: volumeChartContainer.value.offsetWidth,
        height: volumeChartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });
    volumeSeries = volumeChart.addHistogramSeries({ color: 'rgba(4, 232, 36, 0.8)', priceFormat: { type: 'volume' } });

    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    supportLineSeries = chart.addLineSeries({
        color: "green",
        lineWidth: 3,
    });
    resistanceLineSeries = chart.addLineSeries({
        color: "red",
        lineWidth: 3,
    });
});

onUnmounted(() => {
    if (chart) {
        chart.remove();
        chart = null;
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
});
</script>
