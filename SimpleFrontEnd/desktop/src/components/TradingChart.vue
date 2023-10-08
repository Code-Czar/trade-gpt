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
        <select v-model="selectedTimeFrame" @change="() => updateChartsFromPair()">
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
        <div v-if="showRSI" ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
        <div v-if="showVolume" ref="volumeChartContainer" style="width: 100%; height: 300px"></div>
        <!-- <div ref="rsiChartContainer" style="width: 100%; height: 200px"></div>
        <div ref="volumeChartContainer" style="width: 100%; height: 300px"></div> -->
        <div v-if="showMACD" ref="macdChartContainer" style="width: 100%; height: 300px"></div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { dataStore } from '@/stores/example-store';
import { SMA, EMA, RSI, MACD } from 'technicalindicators';
import { indicators } from '@/models'

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
let candlestickChart = null;
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
let bullishFractalSeries = null;
let bearishFractalSeries = null;
let bullishFractalLines = [];
let bearishFractalLines = [];


// const supportData = store.supportData[0];
// const resistanceData = store.resistanceData[0];
let supportLineSeries;
let resistanceLineSeries;
let supportLine;
let resistanceLine;

const showSupport = ref(false);
const showResistance = ref(false);
let formattedData = null;

const selectedTimeFrame = ref('5m');
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
    // console.log('🚀 ~ file: TradingChart.vue:66 ~ toggleVolumes ~ showVolume.value:', showVolume.value);
};

const toggleMACD = () => {
    showMACD.value = !showMACD.value;
    updateChartsFromPair();
};
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const addEMA = async (formattedData, period = 14, color = 'rgba(255, 0, 7, 1)') => {
    const { emaData } = await indicators.calculateEMA(formattedData, period)

    if (emaSeries[period]) {
        emaSeries[period].setData(emaData);
    } else {
        emaSeries[period] = candlestickChart.addLineSeries({ color, lineWidth: 1 });
        emaSeries[period].setData(emaData);
    }
}
const addEMAFromData = async (emaData, period = 14, color = 'rgba(255, 0, 7, 1)') => {


    if (emaSeries[period]) {
        emaSeries[period].setData(emaData);
    } else {
        emaSeries[period] = candlestickChart.addLineSeries({ color, lineWidth: 1 });
        emaSeries[period].setData(emaData);
    }
}

const formatOHLCVForChartData = async (data) => {
    if (!data) return [];
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
    return result;
};

const createCandleStickChart = async () => {
    candlestickChart = createChart(chartContainer.value, {
        width: chartContainer.value.offsetWidth,
        height: chartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });
    candlestickSeries = candlestickChart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    supportLineSeries = candlestickChart.addLineSeries({
        color: "green",
        lineWidth: 3,
    });
    resistanceLineSeries = candlestickChart.addLineSeries({
        color: "red",
        lineWidth: 3,
    });
    bullishFractalSeries = candlestickChart.addLineSeries({ color: 'green', lineWidth: 1, lineStyle: 1 });
    bearishFractalSeries = candlestickChart.addLineSeries({ color: 'red', lineWidth: 1, lineStyle: 1 });
}

const createRSIChart = async () => {
    rsiChart = createChart(rsiChartContainer.value, {
        width: rsiChartContainer.value.offsetWidth,
        height: rsiChartContainer.value.offsetHeight,
        timeScale: {
            timeVisible: true,
            // Use timeFormat to format the date as per your preference
            timeFormat: 'yyyy-MM-dd HH:mm', // Example format, adjust as needed
        },
    });
}
const createVolumeChart = async () => {
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
}
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
}

const updateData = async (symbolPair) => {
    if (!symbolPair) return;
    const seriesValues = symbolPair.ohlcvs[selectedTimeFrame.value];
    const firstSerie = seriesValues;
    if (!firstSerie || !candlestickChart) return;

    formattedData = await formatOHLCVForChartData(firstSerie);
}

// const updateCharts = async (inputData = formattedData) => {
//     if (!formattedData) return;
//     if (candlestickSeries) {
//         candlestickSeries.setData(formattedData);
//     }
//     if (showBollingerBands.value) {

//         const { upperBand, lowerBand, middleBand } = await indicators.calculateBollingerBands(formattedData, 20)

//         if (upperBandSeries) {
//             upperBandSeries.setData(upperBand);
//         } else {
//             upperBandSeries = candlestickChart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
//             upperBandSeries.setData(upperBand);
//         }

//         if (middleBandSeries) {
//             middleBandSeries.setData(middleBand);
//         } else {
//             middleBandSeries = candlestickChart.addLineSeries({ color: '#2c3e50', lineWidth: 1 });
//             middleBandSeries.setData(middleBand);
//         }

//         if (lowerBandSeries) {
//             lowerBandSeries.setData(lowerBand);
//         } else {
//             lowerBandSeries = candlestickChart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
//             lowerBandSeries.setData(lowerBand);
//         }
//     } else {
//         if (upperBandSeries) {
//             candlestickChart.removeSeries(upperBandSeries);
//             upperBandSeries = null;
//         }

//         if (middleBandSeries) {
//             candlestickChart.removeSeries(middleBandSeries);
//             middleBandSeries = null;
//         }

//         if (lowerBandSeries) {
//             candlestickChart.removeSeries(lowerBandSeries);
//             lowerBandSeries = null;
//         }
//     }

//     if (showRSI.value) {
//         if (!rsiChart) {
//             await createRSIChart()
//         }
//         const { rsiData } = await indicators.calculateRSI(formattedData)

//         if (rsiSeries) {
//             rsiSeries.setData(rsiData);
//         } else {
//             rsiSeries = rsiChart.addLineSeries({ color: 'rgba(4, 232, 36, 1)', lineWidth: 1 });
//             rsiSeries.setData(rsiData);
//         }
//     } else {
//         if (rsiSeries) {
//             rsiChart.removeSeries(rsiSeries);
//             rsiSeries = null;
//         }
//     }

//     if (showSMA.value) {
//         if (!macdChart) {
//             await createMACDChart()
//         }
//         const smaData = await indicators.calculateSMA(formattedData)
//         if (smaSeries) {
//             smaSeries.setData(smaData);
//         } else {
//             smaSeries = candlestickChart.addLineSeries({ color: 'rgba(0, 255, 255, 1)', lineWidth: 1 });
//             smaSeries.setData(smaData);
//         }
//     } else {
//         if (smaSeries) {
//             candlestickChart.removeSeries(smaSeries);
//             smaSeries = null;
//         }
//     }

//     if (showEMA.value) {
//         addEMA(formattedData, 7, '#f1c40f')
//         addEMA(formattedData, 14, '#2980b9')
//         addEMA(formattedData, 28, '#8e44ad')

//     } else {
//         const series = Object.values(emaSeries)
//         if (series.length > 0) {
//             series.forEach((emaSerie) => {

//                 candlestickChart.removeSeries(emaSerie);
//             })
//             emaSeries = {};
//         }
//     }

//     if (showVolume.value) {
//         if (!volumeChart) {
//             await createVolumeChart()
//         }
//         const volumeData = await indicators.calculateVolumes(formattedData)
//         // console.log('🚀 ~ file: TradingChart.vue:250 ~ watchEffect ~ volumeData:', volumeData);
//         volumeSeries?.setData(volumeData);
//     } else {
//         volumeSeries?.setData([]); // set data to an empty array to clear the volume data
//     }

//     if (showMACD.value) {
//         if (!macdChart) {
//             await createMACDChart()
//         }
//         const { macdData, signalData, histogramData } = await indicators.calculateMACD(formattedData)

//         if (macdSeries) {
//             macdSeries.setData(macdData);
//         } else {
//             macdSeries = macdChart.addLineSeries({ color: 'rgba(4, 232, 36, 1)', lineWidth: 1 });
//             macdSeries.setData(macdData);
//         }

//         if (macdSignalSeries) {
//             macdSignalSeries.setData(signalData);
//         } else {
//             macdSignalSeries = macdChart.addLineSeries({ color: 'rgba(0, 123, 255, 1)', lineWidth: 1 });
//             macdSignalSeries.setData(signalData);
//         }

//         if (macdHistogramSeries) {
//             macdHistogramSeries.setData(histogramData);
//         } else {
//             macdHistogramSeries = macdChart.addHistogramSeries({
//                 color: 'rgba(255, 193, 7, 0.8)',
//                 priceFormat: { type: 'volume' },
//             });
//             macdHistogramSeries.setData(histogramData);
//         }
//     } else {
//         if (macdSeries) {
//             macdChart.removeSeries(macdSeries);
//             macdSeries = null;
//         }

//         if (macdSignalSeries) {
//             macdChart.removeSeries(macdSignalSeries);
//             macdSignalSeries = null;
//         }

//         if (macdHistogramSeries) {
//             macdChart.removeSeries(macdHistogramSeries);
//             macdHistogramSeries = null;
//         }
//     }

//     // const firstTimeValue = formattedData[0].time;
//     if (showSupport.value) {
//         store.supportData.forEach((support) => {
//             // console.log("🚀 ~ file: TradingChart.vue:398 ~ store.resistanceData.forEach ~ support:", support[4])

//             const supportLineData = formattedData.map((value) => ({
//                 time: value.time,
//                 value: Object.values(support)[3],
//                 color: 'green',
//                 lineWidth: 2,
//             }));
//             supportLineSeries.setData(supportLineData);
//         })


//     } else {

//     }

//     if (showResistance.value) {
//         store.resistanceData.forEach((resistance) => {
//             const resistanceLineData = formattedData.map((value) => ({
//                 time: value.time,
//                 value: Object.values(resistance)[3],
//                 color: 'red',
//                 lineWidth: 2,
//             }));;
//             resistanceLineSeries.setData(resistanceLineData);
//         })

//     } else {

//     }
// }
const updateChartsFromPair = async (symbolPairName = props.inputSymbol) => {
    const symbolPair = store.pairs.get(symbolPairName)
    console.log("🚀 ~ file: TradingChart.vue:495 ~ updateChartsFromPair ~ symbolPair:", symbolPair, symbolPairName)
    if (!formattedData) return;
    if (candlestickSeries) {
        candlestickSeries.setData(formattedData);
    }
    if (showBollingerBands.value) {

        console.log("🚀 ~ file: TradingChart.vue:503 ~ updateChartsFromPair ~ symbolPair.bollingerBands:", symbolPair.bollingerBands)
        const { upperBand, lowerBand, middleBand } = symbolPair.bollingerBands[selectedTimeFrame.value]

        if (upperBandSeries) {
            upperBandSeries.setData(upperBand);
        } else {
            upperBandSeries = candlestickChart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
            upperBandSeries.setData(upperBand);
        }

        if (middleBandSeries) {
            middleBandSeries.setData(middleBand);
        } else {
            middleBandSeries = candlestickChart.addLineSeries({ color: '#2c3e50', lineWidth: 1 });
            middleBandSeries.setData(middleBand);
        }

        if (lowerBandSeries) {
            lowerBandSeries.setData(lowerBand);
        } else {
            lowerBandSeries = candlestickChart.addLineSeries({ color: 'rgba(4, 111, 232, 1)', lineWidth: 1 });
            lowerBandSeries.setData(lowerBand);
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
            await createRSIChart()
        }
        const rsiData = symbolPair.rsi[selectedTimeFrame.value].rsiData

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
        if (!macdChart) {
            await createMACDChart()
        }
        const smaData = symbolPair.sma[selectedTimeFrame.value].smaData
        if (smaSeries) {
            smaSeries.setData(smaData);
        } else {
            smaSeries = candlestickChart.addLineSeries({ color: 'rgba(0, 255, 255, 1)', lineWidth: 1 });
            smaSeries.setData(smaData);
        }
    } else {
        if (smaSeries) {
            candlestickChart.removeSeries(smaSeries);
            smaSeries = null;
        }
    }

    if (showEMA.value) {
        addEMAFromData(symbolPair.ema[selectedTimeFrame.value].ema7, 7, '#f1c40f')
        addEMAFromData(symbolPair.ema[selectedTimeFrame.value].ema14, 14, '#2980b9')
        addEMAFromData(symbolPair.ema[selectedTimeFrame.value].ema28, 28, '#2980b9')


    } else {
        const series = Object.values(emaSeries)
        if (series.length > 0) {
            series.forEach((emaSerie) => {

                candlestickChart.removeSeries(emaSerie);
            })
            emaSeries = {};
        }
    }

    if (showVolume.value) {
        if (!volumeChart) {
            await createVolumeChart()
        }
        const volumeData = symbolPair.volumes[selectedTimeFrame.value]
        // console.log('🚀 ~ file: TradingChart.vue:250 ~ watchEffect ~ volumeData:', volumeData);
        volumeSeries?.setData(volumeData);
    } else {
        volumeSeries?.setData([]); // set data to an empty array to clear the volume data
    }

    if (showMACD.value) {
        if (!macdChart) {
            await createMACDChart()
        }
        const { macdData, signalData, histogramData } = symbolPair.macd[selectedTimeFrame.value]

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
    if (showSupport.value || showResistance.value) {
        const { bullishFractals, bearishFractals } = indicators.findFractals(formattedData);

        // Removing old fractal lines
        bullishFractalLines.forEach(line => candlestickChart.removeSeries(line));
        bearishFractalLines.forEach(line => candlestickChart.removeSeries(line));

        bullishFractalLines = [];
        bearishFractalLines = [];

        // Adding new fractal lines
        bullishFractals.forEach(fractal => {
            const line = candlestickChart.addLineSeries({
                color: 'green',
                lineWidth: 1,
                lineStyle: 0,  // Solid line
            });
            line.setData([{ time: fractal.time, value: fractal.value }, { time: formattedData[formattedData.length - 1].time, value: fractal.value }]);
            bullishFractalLines.push(line);
        });

        bearishFractals.forEach(fractal => {
            const line = candlestickChart.addLineSeries({
                color: 'red',
                lineWidth: 1,
                lineStyle: 0,  // Solid line
            });
            line.setData([{ time: fractal.time, value: fractal.value }, { time: formattedData[formattedData.length - 1].time, value: fractal.value }]);
            bearishFractalLines.push(line);
        });
    } else {
        bullishFractalLines.forEach(line => line.setData([]));
        bearishFractalLines.forEach(line => line.setData([]));

    }
}


watchEffect(async () => {
    console.log("🚀 ~ file: TradingChart.vue:497 ~ watchEffect ~ store.pairs:", store.pairs)
    if (store.pairs.size === 0) return;
    const symbolPair = store.pairs.get(props.inputSymbol)
    console.log("🚀 ~ file: TradingChart.vue:693 ~ watchEffect ~ symbolPair:", symbolPair, props.inputSymbol)
    if (!symbolPair) return;
    updateData(symbolPair);
    updateChartsFromPair();
});






onMounted(async () => {
    chartWidth.value = window.innerWidth;
    // let macdChartElement = document.createElement('div');
    await createCandleStickChart()

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
});
</script>
