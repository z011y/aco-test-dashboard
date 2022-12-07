<script setup>
import { onMounted, ref } from 'vue';
import * as d3 from 'd3';
import moment from 'moment';

import data from '../charts/data.json';
import { useLineChart } from '../charts/useLineChart';
import Tooltip from './Tooltip.vue';

const chartRef = ref(null);

onMounted(() => {
    const chart = useLineChart(chartRef.value, data.data, {
        xGetter: (d) => d.x,
        yGetter: (d) => d.y,
        zGetter: (d) => d.z,
    })

    chart.initTooltip('#chart-tooltip');
    chart.drawAxis({
        xFormatFn: (d) => moment(d).format('M/D'),
        yFormatFn: (d) => `${d}ms`
    })
    chart.drawLines();
    chart.drawDataPoints();
})
</script>

<template>
    <div class="w-2/3 h-[384px] relative">
        <svg ref="chartRef" />
        <Tooltip id="chart-tooltip"></Tooltip>
    </div>
</template>