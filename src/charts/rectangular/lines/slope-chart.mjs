import RectangularChart from "../rectangular-chart.mjs";

("use strict");

/**
 * @description
 * SlopeChart represents previous and posterior state.
 * @class
 * @extends RectangularChart
 */
export default class SlopeChart extends RectangularChart {
  /**
   * @description
   * The size of the radius of the points of the chart.
   * @type {number}
   */
  #radius;
  /**
   * @description
   * Create a new instance of a SlopeChart object.
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
   * const chart = new SlopeChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
    this.#radius = 3;
    this._x = this._getD3Scale("ordinal");
  }

  /**
   * @description
   * Getter and setter for the radius property of the circles of the data points of the series.
   * @param {number} value The size of the radius in pixels for the circles in the series.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new SlopeChart({
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
    this._ySeries = this._getNumericalFieldsToUse([
      this.xConfiguration().serie,
    ]);
    // Set the horizontal values of the x axis
    this.x
      .domain(this.ySeries)
      .range([this.margin().left, this.width() - this.margin().right]);
    // Set the y scale values
    const ySerieRange = this._serieRange(
      this.dataset.flatMap((row) => this.ySeries.map((serie) => row[serie]))
    );
    // Set the scale for the values in the left position of the y series
    this._y = this._getD3Scale(this.yConfiguration().scale);
    this.y
      .domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([this.height() - this.margin().bottom, this.margin().top]);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the color schema
    this.colorScale
      .domain(this.dataset.map((row) => row[this.xConfiguration().serie]))
      .range(this.yConfiguration().colorSeries);
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
    const groupSeries = this.svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .on("mouseover", (e) => this.listeners.call("mouseover", this, e))
      .on("mouseout", (e) => this.listeners.call("mouseout", this, e))
      .attr("class", "series");

    this._seriesShown = !name
      ? this.colorScale.domain()
      : this.colorScale.domain().filter((serie) => serie === name);

    /**
     * @description
     * The rearranged data to create the g elements per category
     * @type {{x: string, values: {serie: string, x: number, y: number}[]}[]}
     */
    const series = this.dataset.map((row) => ({
      x: row[this.xConfiguration().serie],
      values: this.ySeries.map((serie) => ({
        serie,
        x: row[this.xConfiguration().serie],
        y: row[serie],
      })),
    }));

    const groupSerie = groupSeries
      .selectAll("g")
      .data(!name ? series : series.filter((row) => row.x === name))
      .join("g")
      .attr("class", (d) => d.x.toLowerCase().replace(" ", "-"));

    const startPositionLines = (lines) =>
      lines
        .attr("x1", (d) => this.x(d.values.at(0).serie))
        .attr("y1", (d) => this.y(d.values.at(0).y))
        .attr("x2", (d) => this.x(d.values.at(0).serie))
        .attr("y2", (d) => this.y(d.values.at(0).y));

    const finishPositionLines = (lines) =>
      lines
        .transition(this.getTransition())
        .attr("x2", (d) => this.x(d.values.at(-1).serie))
        .attr("y2", (d) => this.y(d.values.at(-1).y))
        .style("stroke-dasharray", "5")
        .transition(this.getTransition())
        .style("stroke-dasharray", null);

    groupSerie
      .selectAll("line")
      .data((d) => [d])
      .join(
        (enter) =>
          enter
            .append("line")
            .call(startPositionLines)
            .call(finishPositionLines),
        (update) => update.call(startPositionLines).call(finishPositionLines),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} serie`)
      .style("stroke", (d) => this.colorScale(d.x));
  }

  /**
   * @description
   * Create the multiline series graph.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new SlopeChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
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
   * const chart = new SlopeChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addSerie("sales");
   * ```
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
   * const chart = new SlopeChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addPoints();
   * ```
   */
  addPoints() {
    const groupSeries = this.svg.select(".series");

    const positionCircles = (circles) =>
      circles
        .attr("cx", (d) => this.x(d.serie))
        .attr("cy", (d) => this.y(d.y))
        .style("fill", "none");

    const growRadius = (circles) =>
      circles
        .transition(this.getTransition())
        .style("fill", (d) => this.colorScale(d.x))
        .attr("r", this.radius());

    groupSeries
      .selectAll("g")
      .selectAll("circle")
      .data((d) => d.values)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("r", 0)
            .call(positionCircles)
            .call(growRadius),
        (update) => update.call(positionCircles).call(growRadius),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} point`);
  }

  /**
   * @description
   * Add the data label to each point the chart.
   * @param {number} [deltaY=-5] The number of pixels to move vertically the text. By default is -5.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new SlopeChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addLabels(-10);
   * ```
   */
  addLabels(deltaY = -5) {
    const groupSeries = this.svg.select(".series");
    groupSeries
      .selectAll("g")
      .selectAll("text")
      .data((d) => d.values)
      .join("text")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} point`)
      .attr("x", (d) => this.x(d.serie))
      .attr("y", (d) => this.y(d.y))
      .attr("dy", deltaY)
      .text((d) => this.yAxis.tickFormat()(d.y))
      .style("fill", (d) => this.colorScale(d.x))
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Render the legenf of the series to explain the color  of each element.
   * @param {object} [config={widthOffset: 0.8, heightOffset: 0.1, size: 5, spacing: 5}] The object configuration to set the square of the legend, spacing and position.
   * @param {number} config.widthOffset The offset in percentage to position the legend group in horizontal position. Zero means closest to left of the screen. The value must be between 0 and 1.
   * @param {number} config.heightOffset The offset in percentage to position the legend group in vertical position. Zero means closest to top of the screen. The value must be between 0 and 1.
   * @param {number} config.size The size of the square in pixels.
   * @param {number} config.spacing The spacing in pixels between the square and the name of the serie.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new SlopeChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addLegend({
   *    widthOffset: 0.75,
   *    heightOffset: 0.15,
   *    size: 4,
   *    spacing: 5
   * });
   * ```
   */
  addLegend(
    config = { widthOffset: 0.85, heightOffset: 0.05, size: 5, spacing: 5 }
  ) {
    const legendGroup = this.svg
      .selectAll(".legends")
      .data([null])
      .join("g")
      .attr("class", "legends")
      .attr(
        "transform",
        `translate(${config.widthOffset * this.width()}, ${
          config.heightOffset * this.height()
        })`
      );

    legendGroup
      .selectAll("rect")
      .data(this.seriesShown)
      .join("rect")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale(d));

    legendGroup
      .selectAll("text")
      .data(this.seriesShown)
      .join("text")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend-name`)
      .attr("x", config.size + config.spacing)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .attr("dy", config.size)
      .text((d) => d)
      .style("fill", (d) => this.colorScale(d));
  }
}
