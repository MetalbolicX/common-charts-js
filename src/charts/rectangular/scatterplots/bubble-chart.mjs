import ScatterPlot from "./scatterplot-chart.mjs";

("use strict");

/**
 * @description
 * BubbleChart represents a chart in rectangular coordinates.
 * @class
 * @extends ScatterPlot
 */
export default class BubbleChart extends ScatterPlot {
  /**
   * @description
   * The name of the serie which has the values to size the radius of each point.
   * @type {string}
   */
  #radiusSerie;
  /**
   * @description
   * The factor to scale the radius of each point. This factor must be between 0 and 1.
   * @type {number}
   */
  #radiusFactor;
  /**
   * @description
   * Create a new instance of a BubbleChart object.
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
   * const chart = new BubbleChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
    this.#radiusFactor = 0.5;
  }

  /**
   * @description
   * Getter and setter a callback to iterate in series that will be radius size.
   * @param {string} name The callback function to deal with some series in the dataset.
   * @returns {string|BubbleChart}
   * @example
   * ```JavaScript
   * const chart = new BubbleChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .radiusSerie("expenses");
   * ```
   */
  radiusSerie(name) {
    return arguments.length && typeof name === "string"
      ? ((this.#radiusSerie = name), this)
      : this.#radiusSerie;
  }

  /**
   * @description
   * Getter and setter for the factor to change the radius.
   * @param {number} value The factor to decrease the radius value. The value must be greater than zero and less than 1.
   * @returns {number|BubbleChart}
   * @example
   * ```JavaScript
   * const chart = new BubbleChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .radiusFactor(0.4);
   * ```
   */
  radiusFactor(value) {
    if (!arguments.length) {
      return this.#radiusFactor;
    }
    if (value > 0 && value <= 1) {
      this.#radiusFactor = +value;
    } else {
      console.error("Invalid value. It must be between 0 and 1");
    }
    return this;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    const xSerieRange = this._serieRange(
      this.dataset.map((d) => d[this.xConfiguration().serie])
    );
    // Set the scale for the values in the bottom position of the x axis
    this._x = this.xConfiguration()
      .scale.domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);
    // Get the numerical fields names
    this._ySeries = this._getNumericalFieldsToUse([
      this.xConfiguration().serie,
      this.radiusSerie(),
    ]);
    const ySerieRange = this._serieRange(
      this.dataset.flatMap((d) => this.ySeries.map((serie) => d[serie]))
    );
    // Set the scale for the values in the left position of the y series
    this._y = this.yConfiguration()
      .scale.domain([
        (1 - this.yAxisOffset()) * ySerieRange.min,
        (1 + this.yAxisOffset()) * ySerieRange.max,
      ])
      .range([this.height() - this.margin().bottom, this.margin().top]);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the categories of the dataset
    const categoryValues = this.dataset.map(
      (d) => d[this.categoryConfiguration().serie]
    );
    // Set the color schema
    this.colorScale
      .domain(categoryValues.filter((d, i, ns) => ns.indexOf(d) == i))
      .range(this.categoryConfiguration().colors);
    // );
    // Set the the x axis customizations of format
    if (this.xAxisConfig().customizations) {
      for (const [xFormat, customFormat] of Object.entries(
        this.xAxisConfig().customizations
      )) {
        this.xAxis[xFormat](customFormat);
      }
    }
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
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const seriesGroup = this.svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .on("mouseover", (e) => this.listeners.call("mouseover", this, e))
      .on("mouseout", (e) => this.listeners.call("mouseout", this, e))
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    seriesGroup
      .selectAll(".serie")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    const initializeCircles = (circles) =>
      circles
        .attr("r", 0)
        .attr("cx", (d) => this.x(d.x))
        .attr("cy", (d) => this.y(d.y));

    const growthCircles = (circles) =>
      circles
        .transition(this.getTransition())
        .delay((_, i) => 100 * i)
        .attr("r", (d) => d.radius * this.radiusFactor());

    seriesGroup
      .selectAll(".serie")
      .selectAll("circle")
      .data((d) =>
        this.dataset.map((row) => ({
          ...this.getSerie(row, d),
          radius: row[this.radiusSerie()],
        }))
      )
      .join(
        (enter) =>
          enter.append("circle").call(initializeCircles).call(growthCircles),
        (update) => update.call(initializeCircles).call(growthCircles),
        (exit) => exit.remove()
      )
      .attr(
        "class",
        (d) =>
          `${d.serie.toLowerCase().replace(" ", "-")} ${d.category
            .toLowerCase()
            .replace(" ", "-")} point`
      )
      .style("fill", (d) => this.colorScale(d.category));
  }

  /**
   * @description
   * Creates the data points in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new BubbleChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   *
   * chart.init();
   * chart.addAllSeries();
   * ```
   */
  addAllSeries() {
    this.#addSeries("");
  }

  /**
   * @description
   * Create the just one serie in the chart by the given name.
   * @param {string} name The name of the serie to create.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new BubbleChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   *
   * chart.init();
   * chart.addSerie();
   * ```
   */
  addSerie(name) {
    this.#addSeries(name);
  }
}
