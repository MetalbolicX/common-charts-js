import ScatterPlot from "./scatterplot-chart.mjs";

("use strict");

export default class BubbleChart extends ScatterPlot {
  #radiusSerie;
  #radiusValues;
  #radiusFactor;
  constructor() {
    super();
    this.#radiusFactor = 0.5;
  }

  /**
   * @description
   * Getter and setter a callback to iterate in series that will be radius size.
   * @param {(d: object) => any} fn The callback function to deal with some series in the dataset.
   * @returns {(d: object) => any|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
   *  .data([
   *    { month: "February", department: "Sales", europe: 52, asia: 40, america: 65 },
   *    { month: "March", department: "Sales", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .radiusSerie((d) => d.europe);
   * ```
   */
  radiusSerie(fn) {
    return arguments.length
      ? ((this.#radiusSerie = fn), this)
      : this.#radiusSerie;
  }

  /**
   * @description
   * Setter for the categories in the dataset.
   * @param {number[]} values The array of values for categories in the dataset.
   * @access @protected
   */
  set _radiusValues(values) {
    if (Array.isArray(values) && values.every((d) => typeof d === "number")) {
      this.#radiusValues = [...values];
    } else {
      console.error("Invalid input values. It must be an array of numbers");
    }
  }

  /**
   * @description
   * Getter for the radius values in the dataset.
   * @return {number[]}
   */
  get radiusValues() {
    return this.#radiusValues;
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
    this._xValues = this.data().map((d) => this.xSerie()(d));
    const xSerieRange = this._serieRange(this.xValues);

    // Set the scale for the values in the bottom position of the x axis
    this._x = this.xScale()
      .domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);

    this._yValues = this.data().map((d) => this.ySeries()(d));
    const ySerieRange = this._serieRange(this.yValues);

    this._radiusValues = this.data().map((d) => this.radiusSerie()(d));

    // Set the scale for the values in the left position of the y series
    this._y = this.yScale()
      .domain([
        (1 - this.yAxisOffset()) * ySerieRange.min,
        (1 + this.yAxisOffset()) * ySerieRange.max,
      ])
      .range([this.height() - this.margin().bottom, this.margin().top]);

    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisPosition()).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisPosition()).scale(this.y);

    // Set the column names of the y series
    this._ySeriesNames = [this.serieToShow()];
    // Set the svg container of the chart
    this._setSvg();
    // Set the categories of the dataset
    this._categoryValues = this.data().map((d) => this.categorySerie()(d));
    // Set the color schema
    this.colorScale().domain(
      // Unique values of the categories
      this.categoryValues.filter((d, i, ns) => ns.indexOf(d) == i)
    );
    // Set the the x axis customizations of format
    if (this.xAxisCustomizations()) {
      for (const [xFormat, customFormat] of Object.entries(
        this.xAxisCustomizations()
      )) {
        this.xAxis[xFormat](customFormat);
      }
    }
    // Set the y axis customizations of the y axis.
    if (this.yAxisCustomizations()) {
      for (const [yFormat, customFormat] of Object.entries(
        this.yAxisCustomizations()
      )) {
        this.yAxis[yFormat](customFormat);
      }
    }
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
   * char.addSeries();
   * ```
   */
  addSeries() {
    const seriesGroup = this._svg.append("g").attr("class", "series");
    seriesGroup
      .selectAll(".serie")
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    seriesGroup
      .selectAll(".serie")
      .selectAll("circle")
      .data((d) =>
        this.yValues.map((r, i) => ({
          serie: d,
          x: this.xValues.at(i),
          y: r,
          category: this.categoryValues.at(i),
          radius: this.radiusValues.at(i),
        }))
      )
      .join("circle")
      .attr("class", (d) => `${d.serie.toLowerCase().replace(" ", "-")} point`)
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", (d) => d.radius * this.radiusFactor())
      .style("fill", (d) => this.colorScale()(d.category));
  }
}
