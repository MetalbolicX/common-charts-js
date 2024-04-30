import RectangularChart from "../rectangular-chart.mjs";

const { line, scaleOrdinal } = d3;

("use strict");

export default class MultiLineChart extends RectangularChart {
  #radius;
  constructor() {
    super();
    this.#radius = 3;
  }

  /**
   * @description
   * Getter and setter for the radius property of the circles of the data points of the series.
   * @param {number} value The size of the radius in pixels for the circles in the series.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new MultiLineChart()
   *  .radius(5);
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
      this.data().map(({ [this.xConfiguration().serie]: value }) => value)
    );
    // Set the scale for the values in the bottom position of the x axis
    this._x = this.xConfiguration()
      .scale.domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);
    // Set the names of the numerical series
    this._fieldsTypes = this.data().at(0);
    // Set categorical fields
    this._categoricalSeries = this._getCategoricalSeries();
    // Set the numerical series to use
    this._ySeries = this._getNumericalFieldsToUse(this.xConfiguration().serie);
    // Which are the range of values for the y scale
    const ySerieRange = this._serieRange(
      this.data().flatMap((d) => this.ySeries.map((serie) => d[serie]))
    );
    // Which are the maximum and critical points per each serie
    this._setCriticalPoints();
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
    // Set the svg container of the chart
    this._setSvg();
    // Set the color schema
    this._colorScale = scaleOrdinal()
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
    const groupSeries = this._svg
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
        values: this.data().map((row) => ({
          x: row[this.xConfiguration().serie],
          y: row[serie],
        })),
      },
    ];

    const drawSerie = (selection) =>
      selection
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
            .transition(this.getTransition())
            .call(drawSerie),
        (update) =>
          update
            .style("stroke", null)
            .transition(this.getTransition())
            .call(drawSerie),
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
   * const chart = new MultiLineChart()
   *  ...;
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
   * const chart = new MultiLineChart()
   *  ...;
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
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * chart.addPoints();
   * ```
   */
  addPoints() {
    const seriesGroup = this._svg.select(".series").selectChildren("g");

    const positionCircles = (circles) =>
      circles
        .attr("r", 0)
        .attr("cx", (d) => this.x(d.x))
        .attr("cy", (d) => this.y(d.y));

    seriesGroup
      .selectAll("circle")
      .data((d) => this.data().map((row) => this.getSerieData(row, d)))
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
   * Add the div elements to the DOM, so that it can be used to display the tooltip.
   * @param {object} tooltipStyles The object literal with the CSS styles to apply to the tooltip.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * chart.addTooltip({
   *      opacity: "0",
   *      background: "#eeeeee",
   *      pointerEvents: "none",
   *      borderRadius: "2px",
   *      padding: "5px",
   *      position: "absolute",
   *      top: "0",
   *      left: "0",
   *      zIndex: "1",
   * });
   * ```
   */
  addTooltip(
    tooltipStyles = {
      opacity: "0",
      background: "#eeeeee",
      pointerEvents: "none",
      borderRadius: "2px",
      padding: "5px",
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "1",
    }
  ) {
    let tooltip = document.querySelector("#tooltip");
    // In case the tooltip element exists
    if (tooltip) {
      return;
    }
    // If the tooltip element does not exist then create it
    tooltip = document.createElement("div");
    tooltip.setAttribute("id", "tooltip");
    // Apply the styles for the tooltip
    for (const cssStyle in tooltipStyles) {
      tooltip.style[cssStyle] = tooltipStyles[cssStyle];
    }
    document.body.append(tooltip);
  }

  /**
   * @description
   * Add the text elements for the critical points (min and max) to each series.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * chart.addCriticalPoints();
   * ```
   */
  addCriticalPoints() {
    const groupCritical = this._svg
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
      .attr("x", (d) => this.x(d.x))
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
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * chart.addLabels();
   * ```
   */
  addLabels() {
    const seriesGroup = this._svg.selectAll(".series").selectChildren("g");
    seriesGroup
      .selectAll("text")
      .data((d) => this.data().map((row) => this.getSerieData(row, d)))
      .join("text")
      .attr("class", (d) => `${d.serie} label`)
      .attr("x", (d) => this.x(d.x))
      .attr("y", (d) => this.y(d.y))
      .text((d) => this.yAxis.tickFormat()(d.y));
  }
}
