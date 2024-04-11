import RectangularChart from "./rectangular-chart.mjs";

("use strict");

const { scaleOrdinal } = d3;

export default class SlopeChart extends RectangularChart {
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
   * const chart = new SlopeChart()
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
    // Select the svg element container for the chart
    this._setSvg();
    const xValues = this.data().map((d) => d[this.xConfiguration().serie]);
    // Set the horizontal values of the x axis
    this._x = this.xConfiguration()
      .scale.domain(this.yConfiguration().numericalSeries)
      .range([this.margin().left, this.width() - this.margin().right]);

    const yValues = this.data().flatMap((d) =>
      this.yConfiguration().numericalSeries.map((r) => d[r])
    );
    const ySerieRange = this._serieRange(yValues);
    // Set the scale for the values in the left position of the y series
    this._y = this.yConfiguration()
      .scale.domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([this.height() - this.margin().bottom, this.margin().top]);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the color schema
    this._colorScale = scaleOrdinal()
      .domain(xValues)
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
   * Create the multiline series graph.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new SlopeChart()
   *  ...;
   *
   * chart.init();
   * char.addSeries();
   * ```
   */
  addSeries() {
    const groupSeries = this._svg.append("g").attr("class", "series");

    groupSeries
      .selectAll("g")
      .data(
        this.data().map((d, i) => ({
          x: d[this.xConfiguration().serie],
          values: this.yConfiguration().numericalSeries.map((serie) => ({
            x: d[this.xConfiguration().serie],
            y: d[serie],
            serie,
          })),
        }))
      )
      .join("g")
      .attr("class", (d) => d.x.toLowerCase().replace(" ", "-"));

    groupSeries
      .selectAll("g")
      .append("line")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} serie`)
      .attr("x1", (d) => this.x(d.values.at(0).serie))
      .attr("y1", (d) => this.y(d.values.at(0).y))
      .attr("x2", (d) => this.x(d.values.at(-1).serie))
      .attr("y2", (d) => this.y(d.values.at(-1).y))
      .style("stroke", (d) => this.colorScale(d.x));
  }

  /**
   * @description
   * Add the circle elements to the points that forms each series in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new SlopeChart()
   *  ...;
   *
   * chart.init();
   * char.addPoints();
   * ```
   */
  addPoints() {
    const groupSeries = this._svg.select(".series");

    groupSeries
      .selectAll("g")
      .selectAll("circle")
      .data((d) => d.values)
      .join("circle")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} point`)
      .attr("cx", (d) => this.x(d.serie))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", this.radius())
      .style("fill", (d) => this.colorScale(d.x));
  }

  /**
   * @description
   * Add the data label to each point the chart.
   * @param {number} [deltaY=-5] The number of pixels to move vertically the text. By default is -5.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new SlopeChart()
   *  ...;
   *
   * chart.init();
   * char.addLabels(-10);
   * ```
   */
  addLabels(deltaY = -5) {
    const groupSeries = this._svg.select(".series");
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
   * const chart = new SlopeChart()
   *  ...;
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
    const legendGroup = this._svg
      .append("g")
      .attr("class", "legends")
      .attr(
        "transform",
        `translate(${config.widthOffset * this.width()}, ${
          config.heightOffset * this.height()
        })`
      );

    /** @type {string[]}*/
    const xValues = this.data().map((d) => d[this.xConfiguration().serie]);

    legendGroup
      .selectAll("rect")
      .data(xValues)
      .join("rect")
      .attr("class", (d) => `${d} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale(d));

    legendGroup
      .selectAll("text")
      .data(xValues)
      .join("text")
      .attr("class", (d) => `${d} legend-name`)
      .attr("x", config.size + config.spacing)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .attr("dy", config.size)
      .text((d) => d)
      .style("fill", (d) => this.colorScale(d));
  }
}
