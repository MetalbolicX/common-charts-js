import RectangularGraph from "./rectangular_graph.mjs";
const { extent, select, line, greatestIndex, format, selectAll } = d3;

("use strict");

/**
 * @description
 * Class for the creation a multi line series chart.
 * @extends RectangularGraph Class for the 2D in rectangular coordinates chart.
 */
export class MultiLineGraph extends RectangularGraph {
  /**
   * @typedef {object} ySerie The record of each y serie.
   * @property {string} serie The name of the serie.
   * @property {Array<number>} values The list of data values.
   */

  /**
   * @typedef {object} rearrangedData The object with data rearranged to plot the multi line series.
   * @property {Array<any>} x The list data for the x axis.
   * @property {Array<ySerie>} y The list of objects for the y axis to draw the lines.
   */

  /**
   * The object containing the rearranged data.
   * @type {rearrangedData}
   */
  #data;
  /** @type {number} */
  #offsetAxis;

  /**
   * @typedef {object} margins The margins for the chart. According to the D3.js conventions.
   * @property {number} top The top margin for the chart.
   * @property {number} right The right margin for the chart.
   * @property {number} bottom The bottom margin for the chart.
   * @property {number} left The left margin for the chart.
   */

  /**
   * @typedef {import("d3").Scale<Domain, Range>} D3Scale
   * @typedef {import("d3").Axis<Domain>} D3Axis
   */

  /**
   * @typedef {object} configMultiLinesChartOptions The config for the multi lines chart.
   * @property {Array<any>} rawData The raw data for the chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} independentScale The D3.js scale to apply for the independent variable data.
   * @property {D3Scale} dependentScale The D3.js scale to apply for the dependent variable data.
   * @property {D3Scale} colorScale The D3.js scale for the colors to apply per each data serie.
   * @property {D3Axis} independentAxis The D3.js object generator for the independent axis variable.
   * @property {D3Axis} dependentAxis The D3.js object generator for the dependent axis variable.
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [factor=0.8] The factor value to position the legend for the chart. By default the factor is 0.8.
   * @property {number} [offsetAxis=0.05] The offset limits for the domain of the dependent variable for better visualization. By default the axis offset is 0.05.
   */

  /**
   * @description
   * Creates a new instance of the Multi lines chart class. By the configuration options.
   * @param {configMultiLinesChartOptions} ConfigMultiLinesChart The options parameters for the new instance.
   */
  constructor({
    rawData,
    svgSelector,
    independentSerie,
    dependentSeries,
    independentScale,
    dependentScale,
    colorScale,
    independentAxis,
    dependentAxis,
    margins = { top: 30, right: 50, bottom: 30, left: 50 },
    factor = 0.8,
    offsetAxis = 0.05,
  }) {
    super({
      svgSelector,
      independentSerie,
      dependentSeries,
      independentScale,
      dependentScale,
      colorScale,
      independentAxis,
      dependentAxis,
      margins,
      factor,
    });
    this.setOffsetAxis = offsetAxis;
    this.#data = {
      x: rawData.map((datum) => datum[this.independentSerie]),
      y: this.dependentSeries.map((serie) => ({
        serie,
        values: rawData.map((datum) => datum[serie]),
      })),
    };
    this._setIndependentScale = independentScale.domain(extent(this.data.x));
    this._setDependentScale = dependentScale.domain([
      (1 - this.offsetAxis) *
        this.data.y
          .map((datum) => Math.min(...datum.values))
          .reduce((lowestMin, lowest) => Math.min(lowestMin, lowest), Infinity),
      (1 + this.offsetAxis) *
        this.data.y
          .map((datum) => Math.max(...datum.values))
          .reduce(
            (highestMax, highest) => Math.max(highestMax, highest),
            Number.NEGATIVE_INFINITY
          ),
    ]);
  }

  /**
   * @description
   * Show the arranged data for the creation of the chart.
   * @returns {rearrangedData}
   */
  get data() {
    return this.#data;
  }

  /**
   * @description
   * The percentage of the offset domain limits for the dependent axis dominant.
   * @returns {number}
   */
  get offsetAxis() {
    return this.#offsetAxis;
  }

  /**
   * @description
   * Setter for the offset domain limits for the dependent axis dominant.
   * @param {number} value A value between 0 and 1.
   */
  set setOffsetAxis(value) {
    if (value <= 0 || value >= 1) {
      throw new Error("The value must be between 0 and 1");
    }
    this.#offsetAxis = value;
  }

  /**
   * @description
   * Show the multi series lines in the svg container selected.
   * @returns {void}
   */
  renderSeries() {
    const gSeries = this.D3Svg.append("g").attr("class", "series");

    gSeries
      .selectAll("g")
      .data(this.data.y)
      .join("g")
      .attr("class", (_, index) => this.dependentSeriesClass.at(index));

    gSeries
      .selectAll("g")
      .selectAll("path")
      .data((datum) => [datum.values])
      .join("path")
      .attr("class", function () {
        return `${select(this.parentElement).attr("class")} serie`;
      })
      .attr(
        "d",
        line()
          .x((_, index) => this._independentScale(this.data.x.at(index)))
          .y((datum) => this._dependentScale(datum))
      )
      .style("fill", "none");

    // Add the color for each serie
    gSeries.selectAll("path").each((_, index, paths) => {
      const currentPath = select(paths[index]);
      const serie = currentPath.attr("class").split(" ").at(0);
      currentPath.style("stroke", this._colorScale(serie));
    });
  }

  /**
   * @description
   * Add the tooltip element to show every datum in the chart.
   * @param {number} [radius=1] The size of the radius of each datum point that is displayed in a line serie By default the radius is 1 pixel.
   * @param {number} [lineWidth=2] The width of the line serie. By default the line stroke width is 2 pixels.
   * @returns {void}
   */
  addTooltip(radius = 1, lineWidth = 2) {
    const gSeries = this.D3Svg.selectAll(".series > g");

    // Add the circles data point
    gSeries
      .selectAll("circle")
      .data((datum) => datum.values)
      .join("circle")
      .attr("class", function () {
        const parentClass = select(this.parentElement).attr("class");
        return `${parentClass} dot`;
      })
      .attr("cx", (_, index) => this._independentScale(this.data.x.at(index)))
      .attr("cy", (datum) => this._dependentScale(datum))
      .attr("r", radius);

    // Add the tooltip element
    const tooltip = select("body")
      .insert("div", `${this.svgSelector} + *`)
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Add the event for the tooltip
    gSeries
      .on("mouseover", (e, d) => {
        // Increade the size of the stroke in the path and circe tags
        select(e.target.parentElement)
          .selectChildren(":is(path, circle)")
          .style("stroke-width", lineWidth);

        if (e.target.matches(".dot")) {
          // Show data point and move tooltip over the circle
          const valueSelected = select(e.target).datum().toFixed(1);

          select(e.target).attr("r", 3 * radius)
            .style("stroke-width", lineWidth);

          tooltip
            .text(`${d.serie}: ${valueSelected}`)
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY - 15}px`)
            .style("opacity", 1);
        }
      })
      .on("mouseout", (e, d) => {
        if (e.target.matches(".dot")) {
          // Desapear the tooltip
          tooltip.transition().duration(1000).style("opacity", 0);
          select(e.target).attr("r", radius);
        }
        // Decrease the size of the stroke in the path and circle tag
        select(e.target.parentElement)
          .selectChildren(":is(path, circle)")
          .style("stroke-width", null);
      });
  }

  /**
   * @description
   * Show the legend refering for each color and name a serie.
   * @param {number} squareSize The size width and height to draw an svg square element for the legend.
   * @returns {void}
   */
  renderLegend(squareSize = 10) {
    const gLegends = this.D3Svg.append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${this.factor * this.width}, ${this.margins.top})`
      );

    gLegends
      .selectAll("rect")
      .data(this.data.y)
      .join("rect")
      .attr("class", (_, index) => this.dependentSeriesClass.at(index))
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("y", (_, index) => (squareSize + 5) * index)
      .style("fill", (datum) => this._colorScale(datum.serie));

    gLegends
      .selectAll("text")
      .data(this.data.y)
      .join("text")
      .attr("class", (_, index) => this.dependentSeriesClass.at(index))
      .attr("x", squareSize + 5)
      .attr("y", (_, index) => (squareSize + 5) * index)
      .attr("dy", squareSize)
      .text((datum) => datum.serie)
      .style("fill", (datum) => this._colorScale(datum.serie));
  }

  /**
   * @description
   * Show the grid of the x axis.
   * @returns {void}
   */
  renderXGrid() {
    const xGrid = this.D3Svg.append("g").attr("class", "x grid");
    xGrid
      .selectAll("line")
      .data(this._independentScale.ticks())
      .join("line")
      .attr("x1", (datum) => this._independentScale(datum))
      .attr("y1", this._dependentScale(this._dependentScale.domain().at(0)))
      .attr("x2", (datum) => this._independentScale(datum))
      .attr("y2", this._dependentScale(this._dependentScale.domain().at(1)));
  }

  /**
   * @description
   * Show the grid of the y axis.
   * @returns {void}
   */
  renderYGrid() {
    const yGrid = this.D3Svg.append("g").attr("class", "y grid");
    yGrid
      .selectAll("line")
      .data(this._dependentScale.ticks())
      .join("line")
      .attr("x1", this._independentScale(this._independentScale.domain().at(0)))
      .attr("y1", (datum) => this._dependentScale(datum))
      .attr("x2", this._independentScale(this._independentScale.domain().at(1)))
      .attr("y2", (datum) => this._dependentScale(datum));
  }

  /**
   * @description
   * Show a pair of arrows at the farthest distance of the axes..
   * @returns {void}
   */
  renderAxisArrows() {
    const gArrows = this.D3Svg.append("g").attr("class", "axis arrows");
    gArrows
      .append("svg:path")
      .attr("class", "x axis arrow")
      .attr("d", () => {
        const x1 = this._independentScale(
          this._independentScale.domain().at(-1)
        );
        const x2 =
          this._independentScale(this._independentScale.domain().at(-1)) + 7;
        const y2 = this._dependentScale(this._dependentScale.domain().at(0));
        const y1 = y2 - 3;
        const y3 = y2 + 3;
        return `M${x1},${y1},${x2},${y2},${x1},${y3}`;
      });

    gArrows
      .append("svg:path")
      .attr("class", "y axis arrow")
      .attr("d", () => {
        const y1 = this._dependentScale(this._dependentScale.domain().at(-1));
        const y2 =
          this._dependentScale(this._dependentScale.domain().at(-1)) - 7;
        const x2 = this._independentScale(
          this._independentScale.domain().at(0)
        );
        const x1 = x2 - 3;
        const x3 = x2 + 3;
        return `M${x1},${y1},${x2},${y2},${x3},${y1}`;
      });
  }
}

export default MultiLineGraph;
