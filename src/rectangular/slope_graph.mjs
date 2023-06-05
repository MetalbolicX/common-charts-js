import RectangularGraph from "./rectangular_graph.mjs";
const { format, select } = d3;

("use strict");

/**
 * Class to create an instance of a slope chart.
 * @extends RectangularGraph Class for the 2D in rectangular coordinates chart.
 */
export class SlopeGraph extends RectangularGraph {
  /** @type {Array<any>}*/
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
   * @typedef {object} configSlopeChartOptions The config for the slope chart.
   * @property {Array<any>} rawData The raw data for the chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} independentScale The D3.js object scale to apply for the independent variable data.
   * @property {D3Scale} dependentScale The D3.js object scale to apply for the dependent variable data.
   * @property {D3Scale} colorScale The D3.js object scale for the colors to apply per each data serie.
   * @property {D3Axis} independentAxis The D3.js object generator for the independent axis variable.
   * @property {D3Axis} dependentAxis The D3.js object generator for the dependent axis variable.
   * @property {string} [independentAxisPosition="bottom"] The position of the independent axis. The positions of the axis are: "top", "right", "bottom" and "left". By default the independent axis position is "bottom".
   * @property {string} [dependentAxisPosition="left"] The position of the dependent axis. The positions of the axis are: "top", "right", "bottom" and "left". By default the independent axis position is "left".
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [factor=0.8] The factor value to position the legend for the chart. By default the factor is 0.8.
   * @property {number} [offsetAxis=0.05] The offset limits for the domain of the dependent variable for better visualization. By default the axis offset is 0.05.
   */

  /**
   * Create a new instance of the slope chart class.
   * @param {configSlopeChartOptions} ConfigSlopeChart The options parameters for the new instance.
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
    independentAxisPosition = "bottom",
    dependentAxisPosition = "left",
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
      independentAxisPosition,
      dependentAxisPosition,
      margins,
      factor,
    });
    this.setOffsetAxis = offsetAxis;
    this.#data = rawData;
    this._setIndependentScale = independentScale.domain(this.dependentSeries);
    this._setDependentScale = dependentScale.domain([
      0,
      (1 + this.offsetAxis) *
        this.data.reduce(
          (highest, datum) =>
            Math.max(
              highest,
              ...this.dependentSeries.map((serie) => datum[serie])
            ),
          Number.NEGATIVE_INFINITY
        ),
    ]);
    this._setColorScale = colorScale.domain(
      this.data.map((datum) => datum[this.independentSerie])
    );
  }

  /** @returns {Array<any>}*/
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
   * Render the lines of the slope chart in the svg container.
   * @param {function} formatFunction The D3.js format function to appropiate format the value to show any datum. The default specifier is a value without decimal points.
   * @param {boolean} isStatic The optional parameter to decide if the bar chart has weather any interaction or it will be statically displayed. Bye default is false or interactive.
   * @returns {void}
   */
  renderLines(formatFunction = format(",.0f"), isStatic = false) {
    const gSeries = this.D3Svg.append("g").attr("class", "series");

    gSeries
      .selectAll("g")
      .data(this.data)
      .join("g")
      .attr("class", (datum) =>
        datum[this.independentSerie].replace(" ", "-").toLowerCase()
      );

    gSeries.selectAll("g").each((datum, index, groups) => {
      const group = select(groups[index]);
      const category = datum[this.independentSerie];
      const yPositionKey = this.dependentSeries[1];

      group
        .append("line")
        .attr("class", category.replace(" ", "-").toLowerCase())
        .attr(
          "x1",
          this._independentScale(this._independentScale.domain().at(0))
        )
        .attr("y1", (datum) =>
          this._dependentScale(datum[this.dependentSeries[0]])
        )
        .attr(
          "x2",
          this._independentScale(this._independentScale.domain().at(1))
        )
        .attr("y2", (datum) =>
          this._dependentScale(datum[this.dependentSeries[1]])
        );

      group
        .append("text")
        .attr("class", `${category.replace(" ", "-").toLowerCase()} unselected`)
        .attr(
          "x",
          this._independentScale(this._independentScale.domain().at(1))
        )
        .attr("y", this._dependentScale(datum[yPositionKey]))
        .attr("dy", -25)
        .text(`${category[0].toUpperCase()}${category.toLowerCase().slice(1)}`);

      group
        .selectAll("circle.point")
        .data(this.dependentSeries)
        .join("circle")
        .attr(
          "class",
          (d) =>
            `${category.replace(" ", "-").toLowerCase()} ${d
              .toLowerCase()
              .replace(" ", "-")} point`
        )
        .attr("r", 2)
        .attr("cx", (_, i) =>
          this._independentScale(this._independentScale.domain().at(i))
        )
        .attr("cy", (d) => this._dependentScale(datum[d]));

      group
        .selectAll("text.label")
        .data(this.dependentSeries)
        .join("text")
        .attr(
          "class",
          (d) =>
            `${category.replace(" ", "-").toLowerCase()} ${d
              .toLowerCase()
              .replace(" ", "-")} label unselected`
        )
        .attr("x", (_, i) =>
          this._independentScale(this._independentScale.domain().at(i))
        )
        .attr("y", (d) => this._dependentScale(datum[d]))
        .attr("dy", -6)
        .text((d) => formatFunction(datum[d]))
        .style("text-anchor", "middle");
    });

    // If the graph is static, it will show the data labels for information
    if (!isStatic) {
      return;
    }

    gSeries.selectAll("g").each((datum, index, groups) => {
      const group = select(groups[index]);
      group
        .selectChild("line")
        .style("stroke", this._colorScale(datum[this.independentSerie]));
      group
        .selectChildren(":not(line)")
        .style("stroke", this._colorScale(datum[this.independentSerie]));
    });
  }

  /**
   * Add the tooltip element to show every datum in the chart.
   * @returns {void}
   */
  addTooltip() {
    const gSeries = this.D3Svg.select(".series");

    // Add the event for the tooltip
    gSeries
      .selectAll("g")
      .on("mouseover", (e, d) => {
        const parent = select(e.target.parentElement);

        parent
          .selectChild("line")
          .style("stroke", this._colorScale(d[this.independentSerie]));
        parent
          .selectChildren(":not(line)")
          .style("fill", this._colorScale(d[this.independentSerie]));

        parent.selectChildren("text").style("opacity", 1);
      })
      .on("mouseout", (e) => {
        const parent = select(e.target.parentElement);

        parent.selectChild("line").style("stroke", null);
        parent.selectChildren(":not(line)").style("fill", null);

        parent.selectChildren("text").style("opacity", null);
      });
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
      .attr(
        "x2",
        this._independentScale(this._independentScale.domain().at(-1)) +
          this._independentScale.bandwidth()
      )
      .attr("y2", (datum) => this._dependentScale(datum));
  }
}

export default SlopeGraph;
