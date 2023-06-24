<template>
    <div ref="chartContainer" style="width: 100%; height: 500px;"></div>
    <div ref="rsiChartContainer" style="width: 100%; height: 200px;"></div>
    <div ref="volumeChartContainer" style="width: 100%; height: 100px;"></div>

    <button @click="toggleBollingerBands">{{ showBollingerBands.value ? 'Hide' : 'Show' }} Bollinger Bands</button>
    <button @click="toggleRSI">{{ showRSI.value ? 'Hide' : 'Show' }} RSI</button>
    <button @click="toggleSMA">{{ showSMA.value ? 'Hide' : 'Show' }} SMA</button>
    <button @click="toggleEMA">{{ showEMA.value ? 'Hide' : 'Show' }} EMA</button>
    <button @click="toggleVolumes">Toggle Volume</button>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart } from 'lightweight-charts';
import { useDataStore } from '~/stores/dataStore';
import { SMA, EMA, RSI } from 'technicalindicators';
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
};

const formatChartData = (data) => {
    if (!data) return [];
    return data.map(datum => ({
        time: datum[0],
        open: datum[1],
        high: datum[2],
        low: datum[3],
        close: datum[4],
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
        const variance = window.reduce((sum, num) => sum + Math.pow(num - smaValues[i - windowSize + 1], 2), 0) / windowSize;
        result.push(Math.sqrt(variance));
    }
    return result;
};


watchEffect(async () => {
    // const newDataValues = Object.values(store.data);
    // const newData = newDataValues[newDataValues.length - 1];
    // if (!newData) return;
    const seriesValues = Object.values(store.data);
    const firstSerie = seriesValues[seriesValues.length - 1];
    if (!firstSerie || !chart) return;
    console.log("🚀 ~ file: TradingChart.vue:26 ~ watch ~ newData:", firstSerie)

    const formattedData = formatChartData(firstSerie);
    console.log("🚀 ~ file: TradingChart.vue:108 ~ watchEffect ~ formattedData:", formattedData)
    if (candlestickSeries) {
        candlestickSeries.setData(formattedData);
    }
    if (showBollingerBands.value) {

        const closePrices = formattedData.map(datum => datum.close);
        const sma20 = sma(closePrices, 20);
        const stdDev20 = standardDeviation(closePrices, 20, sma20);

        const upperBand = sma20.map((value, index) => ({ time: formattedData[index + 19].time, value: value + 2 * stdDev20[index] }));
        const middleBand = sma20.map((value, index) => ({ time: formattedData[index + 19].time, value }));
        const lowerBand = sma20.map((value, index) => ({ time: formattedData[index + 19].time, value: value - 2 * stdDev20[index] }));

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
            period: 14,
        };
        let sma = SMA.calculate(inputSMA);

        let smaData = sma.map((value, index) => ({ time: formattedData[index + inputSMA.period - 1].time, value: value }));

        if (smaSeries) {
            smaSeries.setData(smaData);
        } else {
            smaSeries = chart.addLineSeries({ color: 'rgba(0, 123, 255, 1)', lineWidth: 1 });
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
            emaSeries = chart.addLineSeries({ color: 'rgba(255, 193, 7, 1)', lineWidth: 1 });
            emaSeries.setData(emaData);
        }
    } else {
        if (emaSeries) {
            chart.removeSeries(emaSeries);
            emaSeries = null;
        }
    }

    if (showVolume.value) {
        let volumeData = formattedData.map((data) => ({ time: data.time / 1000, value: data.volume, color: data.open > data.close ? 'rgba(255, 82, 82, 0.8)' : 'rgba(4, 232, 36, 0.8)' }));

        if (volumeSeries) {
            volumeSeries.setData(volumeData);
        } else {
            volumeSeries = volumeChart.addHistogramSeries({ color: 'rgba(4, 232, 36, 0.8)', priceFormat: { type: 'volume' } });
            volumeSeries.setData(volumeData);
        }
    } else {
        if (volumeSeries) {
            volumeChart.removeSeries(volumeSeries);
            volumeSeries = null;
        }
    }

});

onMounted(() => {
    chart = createChart(chartContainer.value, {
        width: chartContainer.value.offsetWidth,
        height: chartContainer.value.offsetHeight,
    });
    rsiChart = createChart(rsiChartContainer.value, { width: rsiChartContainer.value.offsetWidth, height: rsiChartContainer.value.offsetHeight });
    volumeChart = createChart(volumeChartContainer.value, { width: volumeChartContainer.value.offsetWidth, height: volumeChartContainer.value.offsetHeight });

    candlestickSeries = chart.addCandlestickSeries();
});

onUnmounted(() => {
    if (chart) {
        chart.remove();
        chart = null;
    }
});

// window.addEventListener('resize', () => {
//     if (chart) {
//         chart.resize(
//             chartContainer.value.offsetWidth,
//             chartContainer.value.offsetHeight,
//         );
//     }
// });
</script>
  