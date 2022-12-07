import { ref } from 'vue';
import * as d3 from 'd3';

export function useChart(chartRef, data, {
    xGetter,
    yGetter,
    zGetter,
    xScaleFn,
    yScaleFn,
    margin
}) {
    const svg = d3.select(chartRef)
    const width = svg.node().parentElement.clientWidth;
    const height = svg.node().parentElement.clientHeight;

    svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])

    const xMap = d3.map(data, xGetter)
    const xDomain = d3.extent(xMap);
    const xScale = xScaleFn()
        .domain(xDomain)
        .range([margin.left, width - margin.right])

    const yMap = d3.map(data, yGetter);
    const yDomain = d3.extent(yMap);
    const yScale = yScaleFn()
        .domain(yDomain)
        .range([height - margin.bottom, margin.top])

    const zMap = d3.map(data, zGetter);
    const zValues = data.map(zGetter);
    // d3's InternSet extends native Set (reqiured for use with d3.group()) see https://github.com/d3/d3-array/blob/main/README.md#InternSet
    const zDomain = new d3.InternSet(zMap)

    const dataRange = d3.range(xMap.length).filter(i => zDomain);
    const dataMap = d3.map(data, d => d);

    return {
        svg,
        width,
        height,
        xMap,
        xDomain,
        xScale,
        yMap,
        yDomain,
        yScale,
        zMap,
        zValues,
        zDomain,
        dataRange,
        dataMap
    }
}