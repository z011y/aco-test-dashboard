<script setup>
import { onMounted } from 'vue';

import data from '../charts/data.json';
import LineChart from '../charts/lineChart';

onMounted(() => {
    const lineChart = new LineChart('canvas', data.data)
    lineChart.draw();
})
</script>

<template>
    <canvas id="canvas" width="512" height="256" />
</template>