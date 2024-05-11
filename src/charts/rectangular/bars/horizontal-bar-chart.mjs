import VBarChart from "./vertical-bar-chart.mjs";

("use strict");

/**
 * @description
 * HBarChart represents horizontal bars chart.
 * @class
 * @extends VBarChart
 */
export default class HBarChart extends VBarChart {
  /**
   * @description
   * Create a new instance of a HBarChart object.
   * @constructor
   * @param {object} config The object for the constructor parameters.
   * @param {string} config.bindTo The css selector for the svg container to draw the chart.
   * @param {object[]} config.dataset The dataset to create the chart.
   * @example
   * ```JavaScript
   * const dataset = [
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   * ];
   *
   * const chart = new HBarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
  }
  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    // Set the numerical series
    this._ySeries = this._getNumericalFieldsToUse([
      this.xConfiguration().serie,
    ]);
    this._seriesShown = this.ySeries;
    // Set the grant total
    this._setGrantTotal();
    // Rearrange the dataset
    this._reestructureData();
    // Which are the maximum values for the domain of the y configuration
    const yValues = this.dataset.map((row) => ({
      values: row.values,
      total: row.total,
    }));
    const ySerieRange = this._serieRange(
      this.isStacked()
        ? yValues.map((d) => d.total)
        : yValues.flatMap((d) => d.values.map((r) => r.y))
    );
    // Set the band scale for the nain categories
    this.x
      .domain(this.dataset.map((row) => row.x))
      .range([this.margin().top, this.height() - this.margin().bottom])
      .paddingInner(this.innerPadding());
    // Set the bar chart horizontally
    this._y = this._getD3Scale(this.yConfiguration().scale);
    this.y
      .domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([this.margin().left, this.width() - this.margin().right]);
    // Set the color schema
    this.colorScale
      .domain(this.ySeries)
      .range(this.yConfiguration().colorSeries);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the second scale for the grouped bar chart if the graph is not stacked
    this.x1.domain(this.ySeries).range([0, this.x.bandwidth()]);
    // Set the y axis customizations of the y axis.
    if (this.yAxisConfig().customizations) {
      for (const [yFormat, customFormat] of Object.entries(
        this.yAxisConfig().customizations
      )) {
        this.yAxis[yFormat](customFormat);
      }
    }
  }

  /**
   * @description
   * Add the bars in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addBars();
   * ```
   */
  addBars() {
    const barsGroup = this.svg.append("g").attr("class", "bars");
    barsGroup
      .selectAll("g")
      .data(this.dataset)
      .join("g")
      .attr("transform", (d) => `translate(0, ${this.x(d.x)})`)
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} bar-group`);

    barsGroup
      .selectAll("g")
      .selectAll("rect")
      .data((d) => d.values)
      .join("rect")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} bar`)
      .attr(
        "height",
        this.isStacked() ? this.x.bandwidth() : this.x1.bandwidth()
      )
      .attr("width", (d) => this.y(d.y) - this.y(this.y.domain().at(0)))
      .attr("x", (d) =>
        this.isStacked() ? this.y(d.previous) : this.y(this.y.domain().at(0))
      )
      .attr("y", (d) => (this.isStacked() ? 0 : this.x1(d.serie)))
      .style("fill", (d) => this.colorScale(d.serie));
  }

  /**
   * @description
   * Add the grid of the y axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.yGrid();
   * ```
   */
  yGrid() {
    const yGridGroup = this.svg.append("g").attr("class", "y grid");
    yGridGroup
      .selectAll("line")
      .data(this.y.ticks())
      .join("line")
      .attr("x1", (d) => this.y(d))
      .attr("y1", this.margin().top)
      .attr("x2", (d) => this.y(d))
      .attr("y2", this.height() - this.margin().bottom);
  }

  /**
   * @description
   * Add the labels with the values of each bar.
   * @param {number} [deltaX=-5] The quantity of pixels to move the label horizontally. By default is -5.
   * @param {number} [deltaY=5]  The quantity of pixels to move the label vertically. By default is 5.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addLabels(-10, 6);
   * ```
   */
  addLabels(deltaX = -5, deltaY = 5) {
    const bars = this.svg.select(".bars");
    bars
      .selectAll("g")
      .selectAll("text")
      .data((d) => d.values)
      .join("text")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} text-label`)
      .attr("x", (d) => (this.isStacked() ? this.y(d.previous) : this.y(d.y)))
      .attr("y", (d) =>
        this.isStacked() ? this.x.bandwidth() / 2 : this.x1(d.serie)
      )
      .attr("dx", deltaX)
      .attr("dy", this.x1.bandwidth() / 2 + deltaY)
      .text((d) => this.yAxis.tickFormat()(d.y));
  }

  /**
   * @description
   * An arrow at the end of the x axis.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.xAxisArrow();
   * ```
   */
  xAxisArrow() {
    const arrowGroup = this.svg
      .selectAll(".axis.arrows")
      .data([null])
      .join("g")
      .attr("class", "axis arrows");

    arrowGroup
      .append("path")
      .attr("class", "x axis arrow")
      .attr("d", () => {
        const x1 = this.y(this.y.domain().at(-1));
        const x2 = this.y(this.y.domain().at(-1)) + 7;
        const y2 = this.height() - this.margin().bottom;
        const y1 = y2 - 3;
        const y3 = y2 + 3;
        return `M${x1},${y1},${x2},${y2},${x1},${y3}`;
      });
  }
}
