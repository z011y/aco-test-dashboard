import * as d3 from 'd3';

export default function createLineChart({
    data,
    colors,
}, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    xType = d3.scaleLinear, // type of x-scale
    xDomain, // [xmin, xmax]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    zDomain, // array of z-values
    strokeLinecap, // stroke line cap of line
    strokeLinejoin, // stroke line join of line
    strokeWidth = 2, // stroke width of line
    strokeOpacity, // stroke opacity of line
    mixBlendMode = 'multiply', // blend mode of lines
} = {}) {
const xAxisMap = d3.map(data, x);
const yAxisMap = d3.map(data, y);
const zValueMap = d3.map(data, z);
const dataMap = d3.map(data, d => d);

const width = d3.select('.multiline-chart').node().clientWidth;
const height = d3.select('.multiline-chart').node().clientHeight;

// we have the data, just show the axis's

const unique = xAxisMap.filter((value, index, array) => array.indexOf(value) === index);
const stepAmount = (width - marginLeft - marginRight) / (unique.length - 1);
const xRange = d3.range(marginLeft, width, stepAmount); // (left, right, amount of steps)
const yRange = [height - marginBottom, marginTop]

if (defined === undefined) defined = (_, i) => !isNaN(xAxisMap[i]) && !isNaN(yAxisMap[i]);

// Compute default domains, and unique the z-domain.
if (xDomain === undefined) xDomain = xAxisMap.map(d => d);
if (yDomain === undefined) yDomain = [0, d3.max(yAxisMap, d => typeof d === 'string' ? +d : d)];
if (zDomain === undefined) zDomain = zValueMap;
zDomain = new d3.InternSet(zDomain);

// Omit any data not present in the z-domain.
const dataRange = d3.range(xAxisMap.length).filter(i => zDomain.has(zValueMap[i]));

// Construct scales and axes.
const xScale = xType(xDomain, xRange);
const yScale = yType(yDomain, yRange);
const xAxis = d3.axisBottom(xScale)
    .ticks(xRange.length)
    .tickPadding(10)
    .tickSize(0)
    .tickFormat(function(d) {
        return moment(d).format('M/D');
    });
const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat).tickPadding(10).tickSize(0);

// Construct a line generator.
const line = d3.line()
    .curve(curve)
    .x(i => xScale(xAxisMap[i]))
    .y(i => yScale(yAxisMap[i]));

const svg = d3.select('.chart')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .on('pointerenter', () => pointerEntered())
    .on('pointermove', (e) => pointerMoved(e))
    .on('pointerleave', () => pointerLeft())
    .on('touchstart', event => event.preventDefault());

svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(xAxis);

svg.append('g')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(yAxis)
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').clone()
        .attr('x2', width)
        .attr('stroke-opacity', 0.1))
    .call(g => g.append('text')
        .attr('x', -marginLeft)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text(yLabel));

const path = svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-linecap', strokeLinecap)
        .attr('stroke-linejoin', strokeLinejoin)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-opacity', strokeOpacity)
    .selectAll('path')
    .data(d3.group(dataRange, i => zValueMap[i]))
    .join('path')
        .style('mix-blend-mode', mixBlendMode)
        .attr('stroke', ([z]) => colors[z].color)
        .attr('d', ([, dataRange]) => line(dataRange));

const dataPoints = svg.selectAll('dataPoints')
    .data(data)
    .join('circle')
        .attr('fill', d => colors[d.title].color)
        .attr('stroke', 'none')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4);

const tooltip = d3.select('.multiline-chart__tooltip')
    .attr('text-anchor', 'middle');

const pointerMoved = (event) => {
    const [xm, ym] = d3.pointer(event);
    const newClosestDataPoint = d3.least(dataRange, i => Math.hypot(xScale(xAxisMap[i]) - xm, yScale(yAxisMap[i]) - ym)); // get closest point
    if (this.closestDataPoint !== newClosestDataPoint) {
        tooltip.style('display', 'block');
        const closestPointData = dataMap[newClosestDataPoint];

        path.style('opacity', ([z]) => zValueMap[newClosestDataPoint] === z ? '1' : '0.1')
            .filter(z => zValueMap[newClosestDataPoint] === z).raise(); // highlight hovered line

        dataPoints.style('opacity', (z) => zValueMap[newClosestDataPoint] === z.title ? '1' : '0.1')
            .filter(z => zValueMap[newClosestDataPoint] === z).raise(); // highlight hovered dataPoints
        dataPoints.attr('r', (z) => zValueMap[newClosestDataPoint] === z.title && z.date === xAxisMap[newClosestDataPoint] ? 5 : 4); // hovered data point made slightly larger

        tooltip.html(
            `
            <p style='margin-bottom: 5px'>${closestPointData.title}: ${closestPointData.value}</p>
            <p>${closestPointData.date}</p>
            `
        );
        this.tooltipPositioning = {
            x: xScale(xAxisMap[newClosestDataPoint]),
            y: yScale(yAxisMap[newClosestDataPoint]) - 17
        }

        svg.property('value', dataMap[newClosestDataPoint]).dispatch('input', {bubbles: true});

        this.closestDataPoint = newClosestDataPoint;
    }
}

const pointerEntered = () => {
    path.style('mix-blend-mode', null);
    tooltip.style('display', null);
}

const pointerLeft = () => {
    // reset all hovered states
    path.style('mix-blend-mode', mixBlendMode).style('opacity', '1');
    dataPoints.style('opacity', '1').attr('r', 4);
    tooltip.style('display', 'none');
    svg.node().value = null;
    svg.dispatch('input', {bubbles: true});
}

return Object.assign(svg.node(), {value: null});
},