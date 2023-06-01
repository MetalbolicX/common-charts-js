import { extent, select, line, greatestIndex, format, selectAll } from "d3";
import { RectangularGraph } from "./rectangular_graph";

("use strict");

/**
 * Class to create an instance of a multi line series chart.
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
   * Create a new instance of the Multi lines chart class.
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
   * The re arranged data
   * @returns {rearrangedData}
   */
  get data() {
    return this.#data;
  }

  /**
   * The percentage of the offset domain limits for the dependent axis dominant.
   * @returns {number}
   */
  get offsetAxis() {
    return this.#offsetAxis;
  }

  /**
   * @param {number} value A value between 0 and 1.
   */
  set setOffsetAxis(value) {
    if (value <= 0 || value >= 1) {
      throw new Error("The value must be between 0 and 1");
    }
    this.#offsetAxis = value;
  }

  /**
   * Show the multi series lines in the svg container.
   * @param {boolean} isStatic Whether the multi line series chart is dynamically interactive or static.
   * @param {number} deltaX The x position distance to ajust the text svg elements.
   * @param {number} deltaY The y position distance to ajust the text svg elements
   * @returns {void}
   */
  renderSeries(isStatic = false, deltaX = 5, deltaY = -5) {
    const gSeries = this.D3Svg.append("g").attr("class", "series");

    gSeries
      .selectAll("g")
      .data(this.data.y)
      .join("g")
      .attr("class", (datum) => datum.serie);

    gSeries
      .selectAll("g")
      .selectAll("path")
      .data((datum) => [datum.values])
      .join("path")
      .attr("class", function () {
        return select(this.parentElement).attr("class");
      })
      .attr(
        "d",
        line()
          .x((_, index) => this._independentScale(this.data.x.at(index)))
          .y((datum) => this._dependentScale(datum))
      );

    // Add the name of the category to each line
    // Find the highest position per each category and save x and y positon,
    // so that it the text category label can be positioned
    const highestPerSerie = this.data.y.map((datum) => {
      const position = greatestIndex(datum.values);
      return {
        x: this.data.x.at(position),
        y: datum.values.at(position),
        serie: datum.serie,
      };
    });

    gSeries
      .selectAll("g")
      .selectAll("text")
      .data(highestPerSerie)
      .join("text")
      .attr("class", (datum) => `${datum.serie} hide unselected`)
      .attr("x", (datum) => this._independentScale(datum.x))
      .attr("y", (datum) => this._dependentScale(datum.y))
      .attr("dx", deltaX)
      .attr("dy", deltaY)
      .text((datum) => `${datum.serie[0].toUpperCase()}${datum.serie.slice(1)}`)
      .style("fill", (datum) => this._colorScale(datum.serie));

    // Add the color of each path in case the chart do not want to be interactive
    if (isStatic) {
      gSeries.selectAll("path").each((_, index, paths) => {
        const currentPath = select(paths[index]);
        const serie = currentPath.attr("class");
        currentPath.style("stroke", this._colorScale(serie));
      });
    }
  }

  /**
   * Add the tooltip element to show every datum in the chart.
   * @param {function} formatFunction The D3.js format function to display the customized datum. The default specifier is to represent a number without the decimal points.
   * @param {number} radius The size of the radius of the svg circles elements.
   * @returns {void}
   */
  addTooltip(formatFunction = format(",.0f"), radius = 1) {
    const gSeries = this.D3Svg.selectAll(".series > g");

    // Add the circles data point
    gSeries
      .selectAll("circle")
      .data((datum) => datum.values)
      .join("circle")
      .attr("class", function () {
        const parentClass = select(this.parentElement).attr("class");
        return `${parentClass} hide unselected`;
      })
      .attr("cx", (_, index) => this._independentScale(this.data.x.at(index)))
      .attr("cy", (datum) => this._dependentScale(datum))
      .attr("r", radius);

    // Add the tooltip element
    const tooltip = select("body")
      .append("span")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Add the event for the tooltip
    gSeries
      .on("mouseover", (e, d) => {
        // Show the hidden elements
        selectAll(`.${d.serie} .hide`).classed("unselected", false);
        // Add color to the path and circles
        select(e.target.parentElement)
          .selectChildren(":not(text)")
          .style("stroke", this._colorScale(d.serie));

        if (e.target.matches("circle")) {
          // Show data point and move tooltip over the circle
          tooltip
            .text(formatFunction(select(e.target).datum()))
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY - 15}px`)
            .style("opacity", 1);
          // Change the size of the radius
          select(e.target).attr("r", 3 * radius);
        }
      })
      .on("mouseout", (e, d) => {
        if (e.target.matches("circle")) {
          // Hide the tooltip
          tooltip.transition().duration(200).style("opacity", 0);
          // Change to original size of radius
          select(e.target).attr("r", radius);
        }
        // Hide the elements
        selectAll(`.${d.serie} .hide`).classed("unselected", true);
        // Remove the color of selected line
        select(e.target.parentElement)
          .selectChildren(":not(text)")
          .style("stroke", null);
      });
  }

  /**
   * Show the legend of the color and names of each serie.
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
      .attr("class", (datum) => datum.serie)
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("y", (_, index) => (squareSize + 5) * index)
      .style("fill", (datum) => this._colorScale(datum.serie));

    gLegends
      .selectAll("text")
      .data(this.data.y)
      .join("text")
      .attr("class", (datum) => datum.serie)
      .attr("x", squareSize + 5)
      .attr("y", (_, index) => (squareSize + 5) * index)
      .attr("dy", squareSize)
      .text((datum) => `${datum.serie[0].toUpperCase()}${datum.serie.slice(1)}`)
      .style("fill", (datum) => this._colorScale(datum.serie));
  }

  /**
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
