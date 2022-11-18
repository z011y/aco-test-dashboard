import * as d3 from 'd3';

class BaseChart {
    constructor(canvasId, data) {
        const canvas = d3.select(`#${canvasId}`);

        if (!canvas.node()) {
            throw new Error('Unable to select canvas based on id provided');
        }

        const ctx = canvas.node().getContext('2d');

        if (!ctx) {
            throw new Error('Unable to get canvas context');
        }

        const width = canvas.node().width;
        const height = canvas.node().height;
        const margin = {
            top: 15,
            right: 10,
            bottom: 25,
            left: 30
        };

        this.#scaleCanvas(canvas.node(), ctx);

        const xValues = d3.map(data, (d) => d.x);
        const yValues = d3.map(data, (d) => d.y);
        const xMinMax = d3.extent(xValues);
        const yMinMax = d3.extent(yValues);

        const xScale = d3.scaleLinear()
            .domain(xMinMax)
            .range([margin.left, width - margin.right])
        const yScale = d3.scaleLinear()
            .domain(yMinMax)
            .range([height - margin.bottom, margin.top])

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.margin= margin;
        this.xMinMax = xMinMax;
        this.yMinMax = yMinMax;
        this.xScale = xScale;
        this.yScale = yScale;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.data = data;
    }

    /**
     * Gets the device's pixel ratio to scale the canvas. This prevents a blurry image on higher res devices
     * @param {HTMLCanvasElement} canvas reference to the canvas HTML element
     * @param {CanvasRenderingConext2D} ctx reference to the rendering context for the canvas
     */
    #scaleCanvas(canvas, ctx) {
        const dpr = window.devicePixelRatio;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    drawXAxis() {
        const TEXT_ALIGN = 'center';
        const TEXT_BASELINE = 'bottom';
        const TEXT_COLOR = '#4B5563';
        const FONT_SIZE = '12px';
        const FONT_FAMILY = 'Poppins';

        const [start, end] = this.xMinMax;
        const tickCount = 10;

        const xTicks = this.xScale.ticks(tickCount);
        const xTickFormat = this.xScale.tickFormat(tickCount, "s");

        // draw line
        // this.ctx.beginPath();
        // this.ctx.strokeStyle = '#EFF1F8';
        // this.ctx.lineWidth = 1;
        // this.ctx.moveTo(start, this.height - this.margin.bottom)
        // this.ctx.lineTo(end, this.height - this.margin.bottom);
        // this.ctx.stroke();

        // draw text
        this.ctx.textAlign = TEXT_ALIGN;
        this.ctx.textBaseline = TEXT_BASELINE;
        this.ctx.fillStyle = TEXT_COLOR;
        this.ctx.font = `${FONT_SIZE} ${FONT_FAMILY}`;
        xTicks.forEach((d) => {
            this.ctx.beginPath();
            this.ctx.fillText(xTickFormat(d), this.xScale(d), this.height)
        })
    }

    drawYAxis() {
        const [start, end] = this.xMinMax;
        const tickCount = 10;

        const yTicks = this.yScale.ticks(tickCount);
        const yTickFormat = this.yScale.tickFormat(tickCount, "s");

        // draw lines
        this.ctx.strokeStyle = '#EFF1F8';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        yTicks.forEach((d) => {   
            this.ctx.moveTo(this.xScale(start), this.yScale(d));
            this.ctx.lineTo(this.xScale(end), this.yScale(d))
        })
        this.ctx.stroke();

        // draw text
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#4B5563';
        this.ctx.font = '14px Poppins';
        yTicks.forEach((d) => {
            this.ctx.beginPath();
            this.ctx.fillText(yTickFormat(d), 0, this.yScale(d))
        })
    }
}

export default class LineChart extends BaseChart {
    constructor(canvasId, data, {
        lineWidth = 2,
        pointWidth = 10,
        color = '#20C4F4',
        opacity = 0.7
    } = {}) {
        super(canvasId, data);

        this.lineWidth = lineWidth;
        this.pointWidth = pointWidth;
        this.color = color;
        this.opacity = opacity;
    }

    draw() {
        const line = d3.line()
            .x((d) => this.xScale(d.x))
            .y((d) => this.yScale(d.y))
            .context(this.ctx);

        const plotPoints = () => {
            this.data.forEach((d) => {
                this.ctx.beginPath();
                this.ctx.arc(this.xScale(d.x), this.yScale(d.y), this.pointWidth / 2, 0, 2 * Math.PI);
                this.ctx.fillStyle = this.color;
                this.ctx.fill();
            })
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawXAxis();
        this.drawYAxis();

        this.ctx.beginPath();
        line(this.data);
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.opacity = this.opacity;
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();
        plotPoints();

    }
}