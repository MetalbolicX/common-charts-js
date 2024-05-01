import ScatterPlot from "./scatterplot-chart.mjs";

("use strict");

const { scaleOrdinal } = d3;

export default class BubbleChart extends ScatterPlot {
  #radiusSerie;
  #radiusFactor;
  constructor() {
    super();
    this.#radiusFactor = 0.5;
  }

  /**
   * @description
   * Getter and setter a callback to iterate in series that will be radius size.
   * @param {string} name The callback function to deal with some series in the dataset.
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
   *  .data([
   *    { month: "February", department: "Sales", europe: 52, asia: 40, america: 65 },
   *    { month: "March", department: "Sales", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .radiusSerie("europe");
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
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new BubbleChart()
   *  .radiusFactor(0.4);
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
      this.data().map((d) => d[this.xConfiguration().serie])
    );
    // Set the scale for the values in the bottom position of the x axis
    this._x = this.xConfiguration()
      .scale.domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);
    // Get the numerical fields names
    const dataSample = this._getNumericalRow(this.data().at(0), [
      this.xConfiguration().serie,
      this.categoryConfiguration().serie,
      this.radiusSerie(),
    ]);
    this._ySeries = Object.keys(dataSample);
    const ySerieRange = this._serieRange(
      this.data().flatMap((d) => this.ySeries.map((serie) => d[serie]))
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
    // Set the svg container of the chart
    this._setSvg();
    // Set the categories of the dataset
    const categoryValues = this.data().map(
      (d) => d[this.categoryConfiguration().serie]
    );
    // Set the color schema
    this._colorScale = scaleOrdinal()
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
    const seriesGroup = this._svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    seriesGroup
      .selectAll(".serie")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    seriesGroup
      .selectAll(".serie")
      .selectAll("circle")
      .data((d) =>
        this.data().map((row) => ({
          ...this.getSerie(row, d),
          radius: row[this.radiusSerie()],
        }))
      )
      .join("circle")
      .attr("class", (d) => `${d.serie.toLowerCase().replace(" ", "-")} point`)
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", (d) => d.radius * this.radiusFactor())
      .style("fill", (d) => this.colorScale(d.category));
  }

  /**
   * @description
   * Creates the data points in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new BubbleChart()
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
   * const chart = new ScatterPlotMarker()
   *  ...;
   *
   * chart.init();
   * chart.addSerie();
   * ```
   */
  addSerie(name) {
    this.#addSeries(name);
  }
}
