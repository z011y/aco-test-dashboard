import { ref } from 'vue';
import * as d3 from 'd3';

import { useChart } from './useChart';
import { useAxis } from './useAxis';
import { useTooltip } from './useTooltip';
import { qualitativeColors } from './chartColorUtils';

export function useLineChart(chartRef, data, {
    xGetter,
    yGetter,
    zGetter,
    xScaleFn = d3.scaleLinear,
    yScaleFn = d3.scaleLinear,
    margin = {
        top: 30,
        right: 20,
        bottom: 30,
        left: 40
    },
}) {
    const { svg, width, height, xScale, yScale, xMap, yMap, zMap, zValues, dataRange, dataMap } = useChart(chartRef, data, {
        xGetter,
        yGetter,
        zGetter,
        xScaleFn,
        yScaleFn,
        margin
    })

    const tooltip = ref({});
    const path = ref(null);
    const dataPoints = ref(null);
    const closestDataPoint = ref(null);

    const colors = qualitativeColors(zValues);

    svg
        .on('pointermove', pointerMoved)
        .on('pointerenter', pointerEntered)
        .on('pointerleave', pointerLeft);

    // STYLES
    const LINE_WIDTH = 1.5;
    const ACTIVE_LINE_WIDTH = 2;
    const DATA_POINT_RADIUS = 3;
    const ACTIVE_DATA_POINT_RADIUS = 4;
    const OPACITY = 1;
    const INACTIVE_OPACITY = 0.1;

    // CHART BUILDERS

    // initializes the tooltip object and makes the tooltip events available on the object
    function initTooltip(id) {
        const { node, onMouseMove, onMouseEnter, onMouseLeave } = useTooltip(id)

        tooltip.value['node'] = node;
        tooltip.value['onMouseMove'] = onMouseMove;
        tooltip.value['onMouseEnter'] = onMouseEnter;
        tooltip.value['onMouseLeave'] = onMouseLeave;
    }

    /**
     * draws an x and a y axis
     */
    function drawAxis({
        xPositionFn = d3.axisBottom,
        yPositionFn = d3.axisLeft,
        xFormatFn = (d) => d,
        yFormatFn = (d) => d,
    } = {}) {
        const { drawAxis } = useAxis({
            svg,
            width,
            xPositionFn,
            yPositionFn,
            xScale,
            yScale,
            xFormatFn,
            yFormatFn,
            margin
        })

        drawAxis();
    }

    /**
     * draws a line for each categorical value in data
     */
    function drawLines({
        curveFn = d3.curveLinear,
    } = {}) {
        const line = d3.line()
            .curve(curveFn)
            .x(i => xScale(xMap[i]))
            .y(i => yScale(yMap[i]));
    
        // append lines to root svg element
        path.value = svg.append('g')
                .attr('fill', 'none')
                .attr('stroke-width', LINE_WIDTH)
                .attr('stroke-opacity', OPACITY)
            .selectAll('path')
            .data(d3.group(dataRange, i => zMap[i]))
            .join('path')
                .attr('stroke', ([z]) => colors[z].color)
                .attr('d', ([, dataRange]) => line(dataRange));
    }

    /**
     * draws a circle for each data point in data
     */
    function drawDataPoints() {
        // draw visible points
        dataPoints.value = svg.selectAll('dataPoints')
            .data(data)
            .join('circle')
                .attr('class', 'dataPoint')
                .attr('fill', (d) => colors[d.z].color)
                .attr('stroke', 'none')
                .attr('cx', (d, i) => xScale(xMap[i]))
                .attr('cy', (d, i) => yScale(yMap[i]))
                .attr('r', DATA_POINT_RADIUS)
                .style('transition', '0.1s ease-in-out')
    }

    // EVENT HANDLERS

    function pointerMoved(event) {
        const [xm, ym] = d3.pointer(event);
        const newClosestDataPoint = d3.least(dataRange, i => Math.hypot(xScale(xMap[i]) - xm, yScale(yMap[i]) - ym)); // get closest point
        if (closestDataPoint.value !== newClosestDataPoint) {
            const closestPointData = dataMap[newClosestDataPoint];

            path.value
                .style('opacity', ([z]) => zMap[newClosestDataPoint] === z ? OPACITY : INACTIVE_OPACITY)
                .attr('stroke-width', ACTIVE_LINE_WIDTH)
                .filter(d => zMap[newClosestDataPoint] === d).raise(); // raises to appear above other lines

            dataPoints.value
                .style('opacity', (d) => zMap[newClosestDataPoint] === d.z ? OPACITY : INACTIVE_OPACITY)
                .attr('r', (d) => zMap[newClosestDataPoint] === d.z && d.x === xMap[newClosestDataPoint] ? ACTIVE_DATA_POINT_RADIUS : DATA_POINT_RADIUS) // hovered data point made slightly larger
                .filter(z => zMap[newClosestDataPoint] === z).raise(); // raises to appear above other data points

            if (tooltip.value) {
                const tooltipContent = `
                    <p style='margin-bottom: 5px'>${closestPointData.z}: ${closestPointData.y}</p>
                    <p>${closestPointData.x}</p>
                `;

                tooltip.value.onMouseMove(
                    xScale(xMap[newClosestDataPoint]) - tooltip.value.node.node().clientWidth / 2,
                    yScale(yMap[newClosestDataPoint]) - tooltip.value.node.node().clientHeight - 17,
                    tooltipContent
                );
            }

            closestDataPoint.value = newClosestDataPoint;
        }
    }

    function pointerEntered() {
        if (tooltip.value) {
            tooltip.value.onMouseEnter();
        }
    }

    function pointerLeft() {
        // reset all hovered states
        path.value.style('opacity', '1').attr('stroke-width', LINE_WIDTH);
        dataPoints.value.style('opacity', '1').attr('r', DATA_POINT_RADIUS);

        if (tooltip.value) {
            tooltip.value.onMouseLeave();
        }
    }

    return {
        initTooltip,
        drawAxis,
        drawLines,
        drawDataPoints
    }
}