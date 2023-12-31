<template>
    <button @click="toggleBollingerBands">{{ showBollingerBands.value ? 'Hide' : 'Show' }} Bollinger Bands</button>
    <button @click="toggleRSI">{{ showRSI.value ? 'Hide' : 'Show' }} RSI</button>
    <button @click="toggleSMA">{{ showSMA.value ? 'Hide' : 'Show' }} SMA</button>
    <button @click="toggleEMA">{{ showEMA.value ? 'Hide' : 'Show' }} EMA</button>
    <button @click="toggleVolumes">Toggle Volume</button>
    <button @click="toggleMACD">{{ showMACD.value ? 'Hide' : 'Show' }} MACD</button>
    <button @click="toggleSupport">{{ showSupport.value ? 'Hide' : 'Show' }} Support</button>
    <button @click="toggleResistance">{{ showResistance.value ? 'Hide' : 'Show' }} Resistance</button>
    <div ref="chartContainer" style="width: 100%; height: 500px"></div>
    <div ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
    <div ref="volumeChartContainer" style="width: 100%; height: 300px"></div>
    <div ref="macdChartContainer" style="width: 100%; height: 300px"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { useDataStore } from '~/stores/dataStore';
import { SMA, EMA, RSI, MACD } from 'technicalindicators';

let rsiSeries = null;
const showRSI = ref(false);

const toggleRSI = () => {
    showRSI.value = !showRSI.value;
};

const store = useDataStore();
let chart = null;
let candlestickSeries = null;
let upperBandSeries = null;
let middleBandSeries = null;
let lowerBandSeries = null;
const showVolume = ref(false);

const chartContainer = ref(null);

const showBollingerBands = ref(true);

let smaSeries = null;
let emaSeries = null;
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


let supportLineSeries;
let resistanceLineSeries;

let formattedData = null;

const showSupport = ref(false);
const showResistance = ref(false);

const toggleSupport = () => {
    showSupport.value = !showSupport.value;
};

const toggleResistance = () => {
    showResistance.value = !showResistance.value;
};


const toggleSMA = () => {
    showSMA.value = !showSMA.value;
    updateCharts()
};

const toggleEMA = () => {
    showEMA.value = !showEMA.value;
    updateCharts();
};

const toggleBollingerBands = () => {
    showBollingerBands.value = !showBollingerBands.value;
    updateCharts()
};

const toggleVolumes = () => {
    showVolume.value = !showVolume.value;
    // console.log('🚀 ~ file: TradingChart.vue:66 ~ toggleVolumes ~ showVolume.value:', showVolume.value);
    updateCharts();
};

const toggleMACD = () => {
    showMACD.value = !showMACD.value;
    updateCharts();
};

const formatChartData = async (data) => {
    if (!data) return [];
    return data.map((datum) => ({
        time: datum[0],
        open: datum[1],
        high: datum[2],
        low: datum[3],
        close: datum[4],
        volume: datum[5],
    }));
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

const updateData = async (storeData) => {

    console.log("🚀 ~ file: TradingChart.vue:140 ~ watchEffect ~ store.data:", store.data)
    const firstSerie = await storeData;
    if (!firstSerie || !chart) return;
    // console.log('🚀 ~ file: TradingChart.vue:26 ~ watch ~ newData:', firstSerie);

    formattedData = await formatChartData(firstSerie);
}

const updateCharts = async () => {
    if (! await formattedData) {
        return;
    }
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
            middleBandSeries = chart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
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
        let inputEMA = {
            values: formattedData.map((data) => data.close),
            period: 14,
        };
        let ema = EMA.calculate(inputEMA);

        let emaData = ema.map((value, index) => ({ time: formattedData[index + inputEMA.period - 1].time, value: value }));

        if (emaSeries) {
            emaSeries.setData(emaData);
        } else {
            emaSeries = chart.addLineSeries({ color: 'rgba(255, 0, 7, 1)', lineWidth: 1 });
            emaSeries.setData(emaData);
        }
    } else {
        if (emaSeries) {
            chart.removeSeries(emaSeries);
            emaSeries = null;
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
}

watchEffect(async () => {
    const storeData = Object.values(store.data);
    updateData(storeData);
    updateCharts();
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
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 1)',
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
    });
    rsiChart = createChart(rsiChartContainer.value, {
        width: rsiChartContainer.value.offsetWidth,
        height: rsiChartContainer.value.offsetHeight,
    });

    volumeChart = createChart(volumeChartContainer.value, {
        width: volumeChartContainer.value.offsetWidth,
        height: volumeChartContainer.value.offsetHeight,
    });
    volumeSeries = volumeChart.addHistogramSeries({ color: 'rgba(4, 232, 36, 0.8)', priceFormat: { type: 'volume' } });

    candlestickSeries = chart.addCandlestickSeries();
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
