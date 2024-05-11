import RectangularChart from "../rectangular-chart.mjs";

("use strict");

const { line } = d3;

/**
 * @description
 * MultiLineChart represents a multiserie chart in rectangular coordinates.
 * @class
 * @extends RectangularChart
 */
export default class MultiLineChart extends RectangularChart {
  /**
   * @description
   * The size of the radius of the point to draw the serie.
   * @type {number}
   */
  #radius;

  /**
   * @description
   * Create a new instance of a MultiLineChart object.
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
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
    this.#radius = 3;
  }

  /**
   * @description
   * Getter and setter for the radius property of the circles of the data points of the series.
   * @param {number} value The size of the radius in pixels for the circles in the series.
   * @returns {number|MultiLineChart}
   * @example
   * ```JavaScript
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .radius(5);
   * ```
   */
  radius(value) {
    return arguments.length && value >= 0
      ? ((this.#radius = +value), this)
      : this.#radius;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    const xSerieRange = this._serieRange(
      this.dataset.map(({ [this.xConfiguration().serie]: value }) => value)
    );
    // Set the scale for the values in the bottom position of the x axis
    this._x = this._getD3Scale(this.xConfiguration().scale);
    this.x
      .domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);
    // Set the numerical series to use
    this._ySeries = this._getNumericalFieldsToUse([this.xConfiguration().serie]);
    // Which are the range of values for the y scale
    const ySerieRange = this._serieRange(
      this.dataset.flatMap((d) => this.ySeries.map((serie) => d[serie]))
    );
    // Set the scale for the values in the left position of the y series
    this._y = this._getD3Scale(this.yConfiguration().scale);
    this.y
      .domain([
        (1 - this.yAxisOffset()) * ySerieRange.min,
        (1 + this.yAxisOffset()) * ySerieRange.max,
      ])
      .range([this.height() - this.margin().bottom, this.margin().top]);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the color schema
    this.colorScale
      .domain(this.ySeries)
      .range(this.yConfiguration().colorSeries);
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
   * Callback function to iterate throught a serie in the dataset by the serie name.
   * @param {object} row An object from the dataset.
   * @param {string} serie Name of the serie to get the data from the dataset.
   * @returns {{serie: string, x: number, y: number}}
   * @access @protected
   */
  getSerieData(row, serie) {
    return { serie, x: row[this.xConfiguration().serie], y: row[serie] };
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const groupSeries = this.svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .on("mouseover", (e) => this.listeners.call("mouseover", this, e))
      .on("mouseout", (e) => this.listeners.call("mouseout", this, e))
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    groupSeries
      .selectAll("g")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => d.toLowerCase().replace(" ", "-"));

    const lineGenerator = line()
      .x((d) => this.x(d.x))
      .y((d) => this.y(d.y));

    /**
     * @description
     * The rearranged data to drawn the line chart with the svg path element.
     * @param {string} serie The serie datum name.
     * @returns {[{serie: string, values: {x: number, y: number}[]}]}
     */
    const rearrangedData = (serie) => [
      {
        serie,
        values: this.dataset.map((row) => ({
          x: row[this.xConfiguration().serie],
          y: row[serie],
        })),
      },
    ];

    const drawSerie = (selection) =>
      selection
        .transition(this.getTransition())
        .delay((d, i) => i * (this.duration() / d.values.length))
        .attrTween("d", function (d) {
          /** @type {string}*/
          const linePath = lineGenerator(d.values);
          /** @type {number}*/
          const length = this.getTotalLength();
          return (/** @type {number}*/ time) =>
            linePath.substring(0, length * time); //
        })
        .style("stroke", (d) => this.colorScale(d));

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => rearrangedData(d))
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => lineGenerator(d.values))
            .style("fill", "none")
            .call(drawSerie),
        (update) => update.style("stroke", null).call(drawSerie),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.serie} serie`);
  }

  /**
   * @description
   * Create the multiline series graph.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addAllSeries();
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
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addSerie("sales");
   */
  addSerie(name) {
    this.#addSeries(name);
  }

  /**
   * @description
   * Add the circle elements to the points that forms each series in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addPoints();
   */
  addPoints() {
    const seriesGroup = this.svg.select(".series").selectChildren("g");

    const positionCircles = (circles) =>
      circles
        .attr("r", 0)
        .attr("cx", (d) => this.x(d.x))
        .attr("cy", (d) => this.y(d.y));

    seriesGroup
      .selectAll("circle")
      .data((d) => this.dataset.map((row) => this.getSerieData(row, d)))
      .join(
        (enter) =>
          enter
            .append("circle")
            .call(positionCircles)
            .transition(this.getTransition())
            .attr("r", this.radius()),
        (update) =>
          update
            .call(positionCircles)
            .transition(this.getTransition())
            .delay((_, i) => i * 100)
            .attr("r", this.radius()),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.serie} point`)
      .style("fill", (d) => this.colorScale(d.serie));
  }

  /**
   * @description
   * Add the text elements for the critical points (min and max) to each series.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addCriticalPoints();
   */
  addCriticalPoints() {
    const groupCritical = this.svg
      .selectAll(".critical-points")
      .data([null])
      .join("g")
      .attr("class", "critical-points");

    const groupPoints = groupCritical
      .selectAll("g")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} max-and-min`);

    groupPoints
      .selectAll("text")
      .data((d) => this.criticalPoints[d])
      .join("text")
      .attr(
        "class",
        (d) => `${d.serie.toLowerCase().replace(" ", "-")} ${d.point}`
      )
      .transition(this.getTransition())
      .attr("x", (d) =>
        this.x(this.dataset.at(d.x)[this.xConfiguration().serie])
      )
      .attr("y", (d) => this.y(d.y))
      .text((d) => this.yAxis.tickFormat()(d.y))
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Add the data label to each point the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addLabels();
   */
  addLabels() {
    const seriesGroup = this.svg.selectAll(".series").selectChildren("g");
    seriesGroup
      .selectAll("text")
      .data((d) => this.dataset.map((row) => this.getSerieData(row, d)))
      .join("text")
      .attr("class", (d) => `${d.serie} label`)
      .attr("x", (d) => this.x(d.x))
      .attr("y", (d) => this.y(d.y))
      .text((d) => this.yAxis.tickFormat()(d.y));
  }
}
