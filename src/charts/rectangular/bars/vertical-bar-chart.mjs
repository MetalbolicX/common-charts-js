import RectangularChart from "../rectangular-chart.mjs";

const { scaleBand, scaleOrdinal } = d3;

("use strict");

export default class VBarChart extends RectangularChart {
  #x1;
  #innerPadding;
  #sortAscending;
  #isStacked;
  #isPercentage;
  #granTotal;
  #isNormalized;

  constructor() {
    super();
    this.#x1 = undefined;
    this.#innerPadding = 0.1;
    this.#sortAscending = false;
    this.#isStacked = true;
    this.#isPercentage = false;
    this.#granTotal = 0;
    this.#isNormalized = false;
  }

  /**
   * @description
   * Getter and setter for the inner padding space between bars.
   * @param {number} value The space of the inner padding.
   * @returns {number|this}
   * @see {@link https://d3js.org/d3-scale/band}
   * @example
   * ```JavaScript
   * const chart = new VBarChart()
   *  .innerPadding(0.1);
   * ```
   */
  innerPadding(value) {
    return arguments.length && value >= 0 && value <= 1
      ? ((this.#innerPadding = +value), this)
      : this.#innerPadding;
  }

  /**
   * @description
   * Getter and setter of how to sort the chart weather is ascending or descending order.
   * @param {boolean} value How to sort the chart. true means in ascending order, false means in descending.
   * @returns {boolean|this}
   * @example
   * ```JavaScript
   * const chart = new VBarChart()
   *  .sortAscending(true);
   * ```
   */
  sortAscending(value) {
    return arguments.length && typeof value === "boolean"
      ? ((this.#sortAscending = value), this)
      : this.#sortAscending;
  }

  /**
   * @description
   * Getter and setter to indicate wheater the bar chart is stacked vertically or grouped adjacentally.
   * @param {boolean} value To indicate whether the bar chart is stacked vertically or grouped adjacentally. true means stacked vertically.
   * @returns {boolean|this}
   * @example
   * ```JavaScript
   * const chart = new VBarChart()
   *  .isStacked(true);
   * ```
   */
  isStacked(value) {
    return arguments.length && typeof value === "boolean"
      ? ((this.#isStacked = value), this)
      : this.#isStacked;
  }

  /**
   * @description
   * Getter and setter for whether the data will be transformed to percentage.
   * @param {boolean} value To indicate whether the data will be transformed to percentage.
   * @returns {boolean|this}
   */
  isPercentage(value) {
    return arguments.length && typeof value === "boolean"
      ? ((this.#isPercentage = value), this)
      : this.#isPercentage;
  }

  /**
   * @description
   * Getter and setter for whether the data will be normalized per category.
   * @param {boolean} value To indicate whether the data will be normalized.
   * @returns {boolean|this}
   */
  isNormalized(value) {
    return arguments.length && typeof value === "boolean"
      ? ((this.#isNormalized = value), this)
      : this.#isNormalized;
  }

  /**
   * @description
   * Setter for the second scale if the chart is grouped.
   * @param {D3Scale} scale D3 js scale generator function scale.
   * @access @protected
   */
  set _x1(scale) {
    this.#x1 = scale;
  }

  /**
   * @description
   * Getter for the second scale if the chart is grouped.
   * @returns {D3Scale}
   */
  get x1() {
    return this.#x1;
  }

  /**
   * @description
   * Calculate the grant total of each numeric series.
   * @returns {void}
   * @access @protected
   */
  _setGrantTotal() {
    this.#granTotal = this.data()
      .flatMap((d) => this.ySeries.map((serie) => d[serie]))
      .reduce((acc, d) => acc + d, 0);
  }

  /**
   * @description
   * Getter of the grant total of the numeric series
   * @returns {number}
   */
  get grantTotal() {
    return this.#granTotal;
  }

  /**
   * @description
   * Rearrange the dataset to draw the bar chart.
   * @returns {void}
   * @access @protected
   */
  _reestructureData() {
    const records = this.data()
      .map((row) => {
        const totalPerCategory = this.ySeries
          .flatMap((serie) => row[serie])
          .reduce((acc, d) => acc + d, 0);
        const percentageFactor = this.isPercentage() ? this.grantTotal : 1;
        const normalizedFactor = this.isNormalized() ? totalPerCategory : 1;
        return {
          x: row[this.xConfiguration().serie],
          values: this.ySeries
            .map((serie) => ({
              serie,
              x: row[this.xConfiguration().serie],
              y: row[serie],
            }))
            .sort((a, b) => b.y - a.y)
            .map((d, i, ns) => ({
              x: d.x,
              serie: d.serie,
              y: d.y / (percentageFactor * normalizedFactor),
              previous:
                ns.slice(0, i).reduce((acc, r) => acc + r.y, 0) /
                (percentageFactor * normalizedFactor),
            })),
          total: totalPerCategory / (percentageFactor * normalizedFactor),
        };
      })
      .sort((a, b) =>
        !this.sortAscending() ? b.total - a.total : a.total - b.total
      );
    // Reset the records sorted
    this.data(records);
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    // Set the numerical series
    this._ySeries = Object.keys(
      this._getNumericalRow(this.data().at(0), [this.xConfiguration().serie])
    );
    this._seriesShown = this.ySeries;
    // Select the svg element container for the chart
    this._setSvg();
    // Set the grant total
    this._setGrantTotal();
    // Rearrange the dataset
    this._reestructureData();
    // Which are the maximum values for the domain of the y configuration
    const yValues = this.data().map((row) => ({
      values: row.values,
      total: row.total,
    }));
    const ySerieRange = this._serieRange(
      this.isStacked()
        ? yValues.map((d) => d.total)
        : yValues.flatMap((d) => d.values.map((r) => r.y))
    );
    // Set the band scale for the nain categories
    this._x = this.xConfiguration()
      .scale.domain(this.data().map((row) => row.x))
      .range([this.margin().left, this.width() - this.margin().right])
      .paddingInner(this.innerPadding());
    // Set the bar chart horizontally
    this._y = this.yConfiguration()
      .scale.domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([this.height() - this.margin().bottom, this.margin().top]);
    // Set the color schema
    this._colorScale = scaleOrdinal()
      .domain(this.ySeries)
      .range(this.yConfiguration().colorSeries);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the second scale for the grouped bar chart if the graph is not stacked
    this._x1 = scaleBand().domain(this.ySeries).range([0, this.x.bandwidth()]);
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
   * const chart = new VBarChart()
   *  ...;
   *
   * chart.init();
   * chart.addBars();
   * ```
   */
  addBars() {
    const barsGroup = this._svg.append("g").attr("class", "bars");
    barsGroup
      .selectAll("g")
      .data(this.data())
      .join("g")
      .attr("transform", (d) => `translate(${this.x(d.x)}, 0)`)
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} bar-group`);

    barsGroup
      .selectAll("g")
      .selectAll("rect")
      .data((d) => d.values)
      .join("rect")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} bar`)
      .attr(
        "width",
        this.isStacked() ? this.x.bandwidth() : this.x1.bandwidth()
      )
      .attr("height", (d) => this.y(this.y.domain().at(0)) - this.y(d.y))
      .attr("x", (d) => (this.isStacked() ? 0 : this.x1(d.serie)))
      .attr("y", (d) =>
        this.isStacked() ? this.y(d.previous + d.y) : this.y(d.y)
      )
      .style("fill", (d) => this.colorScale(d.serie));
  }

  /**
   * @description
   * Add the grid of the y axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new VBarChart()
   *  ...;
   *
   * chart.init();
   * chart.yGrid();
   * ```
   */
  yGrid() {
    const yGridGroup = this._svg.append("g").attr("class", "y grid");
    yGridGroup
      .selectAll("line")
      .data(this.y.ticks())
      .join("line")
      .attr("x1", this.x(this.x.domain().at(0)))
      .attr("y1", (d) => this.y(d))
      .attr("x2", this.x(this.x.domain().at(-1)) + this.x.bandwidth())
      .attr("y2", (d) => this.y(d));
  }

  /**
   * @description
   * Add the text labels of data of each bar.
   * @param {number} [deltaY=-5] The extra positioning of the text element in the y direction in pixels. By default is -5.
   * @return {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new VBarChart()
   *  ...;
   *
   * chart.init();
   * chart.addLabels(-10);
   * ```
   */
  addLabels(deltaY = -5) {
    const bars = this._svg.select(".bars");
    bars
      .selectAll("g")
      .selectAll("text")
      .data((d) => d.values)
      .join("text")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} text-label`)
      .attr("x", (d) =>
        this.isStacked()
          ? this.x.bandwidth() / 2
          : this.x1(d.serie) + this.x1.bandwidth() / 2
      )
      .attr("y", (d) =>
        this.isStacked() ? this.y(d.previous + d.y) : this.y(d.y)
      )
      .attr("dy", deltaY)
      .text((d) => this.yAxis.tickFormat()(d.y))
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * An arrow at the end of the x axis.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new VBarChart()
   *  ...;
   *
   * chart.init();
   * chart.xAxisArrow();
   * ```
   */
  xAxisArrow() {
    const arrowGroup = this._svg
      .selectAll(".axis.arrows")
      .data([null])
      .join("g")
      .attr("class", "axis arrows");

    arrowGroup
      .append("path")
      .attr("class", "x axis arrow")
      .attr("d", () => {
        const x1 = this.x(this.x.domain().at(-1)) + 0.95 * this.x.bandwidth();
        const x2 =
          this.x(this.x.domain().at(-1)) + 0.95 * this.x.bandwidth() + 7;
        const y2 = this.y(this.y.domain().at(0));
        const y1 = y2 - 3;
        const y3 = y2 + 3;
        return `M${x1},${y1},${x2},${y2},${x1},${y3}`;
      });
  }
}
