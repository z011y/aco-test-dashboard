import * as d3 from 'd3';

export function useAxis({
    svg,
    width, 
    xPositionFn = d3.axisBottom,
    yPositionFn = d3.axisLeft,
    xScale,
    yScale,
    xFormatFn = (d) => d,
    yFormatFn = (d) => d,
    margin
} = {}) {
    const TICK_COUNT = 5;
    const TICK_PADDING = 10;
    const TICK_SIZE = 0;

    const xAxis = xPositionFn(xScale)
        .ticks(TICK_COUNT)
        .tickPadding(TICK_PADDING)
        .tickSize(TICK_SIZE)
        .tickFormat(xFormatFn);

    const yAxis = yPositionFn(yScale)
        .ticks(TICK_COUNT)
        .tickPadding(TICK_PADDING)
        .tickSize(TICK_SIZE)
        .tickFormat(yFormatFn);

    const drawAxis = () => {
        // append x axis to root svg element
        svg.append('g')
        .attr("transform", `translate(0, ${yScale(0)})`)
        .style('font', '12px Poppins')
        .attr('fill', '#4B5563')
        .call(xAxis)
        .call(g => g.select(".domain").remove()) // removes x axis line (replaced by y axis ticks)

        // append y axis to root svg element
        svg.append('g')
        .attr("transform", `translate(${margin.left}, 0)`)
        .style('font', '14px Poppins')
        .attr('fill', '#4B5563')
        .call(yAxis)
        .call(g => g.select(".domain").remove()) // removes y axis line
        .call(g => g.selectAll(".tick line").clone() // extends y axis ticks to span entire chart width
            .attr("x2", width - margin.left - margin.right)
            .attr("stroke", '#EFF1F8'))
    }

    return {
        xAxis,
        yAxis,
        drawAxis
    }
}