import RectangularChart from "./rectangular-chart.mjs";

("use strict");

export default class ScattePlot extends RectangularChart {
  #radius;
  #categoriesSeries;
  #categoriesValues;
  constructor() {
    super();
    this.#radius = 1;
  }

  /**
   * @description
   * Getter and setter for the radius property of the circles of the data points of the series.
   * @param {number} value The size of the radius in pixels for the circles in the series.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
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
   * Getter and setter a callback to iterate in series with has statistical category data type.
   * @param {(d: object) => any} fn The callback function to deal with some series in the dataset.
   * @returns {(d: object) => any|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
   *  .data([
   *    { month: "February", department: "Sales", europe: 52, asia: 40, america: 65 },
   *    { month: "March", department: "Sales", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .categoriesSeries((d) => department: d.department); // An anonymous function that returns an object with the series of categories in the dataset
   * ```
   */
  categoriesSeries(fn) {
    return arguments.length
      ? ((this.#categoriesSeries = fn), this)
      : this.#categoriesSeries;
  }

  /**
   * @description
   * Getter and setter for the categories in the dataset.
   * @param {any[]} values The array of values for categories in the dataset.
   * @returns {any[]}
   * @protected
   */
  categoriesValues(values) {
    return arguments.length
      ? ((this.#categoriesValues = [...values]), this)
      : this.#categoriesValues;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    this.xValues = this.data().map((d) => this.xSerie()(d));
    const xSerieRange = this._serieRange(this.xValues);

    // Set the scale for the values in the bottom position of the x axis
    this.x = this.xScale()
      .domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);

    this.yValues = this.data().map((d) => this.ySeries()(d));
    const ySerieRange = this._serieRange(
      this.yValues.map((d) => Object.values(d)).flat()
    );

    // Set the scale for the values in the left position of the y series
    this.y = this.yScale()
      .domain([
        (1 - this.yAxisOffset()) * ySerieRange.min,
        (1 + this.yAxisOffset()) * ySerieRange.max,
      ])
      .range([this.height() - this.margin().bottom, this.margin().top]);

    // Set the axes
    this.xAxis = this._D3Axis(this.xAxisPosition()).scale(this.x);
    this.yAxis = this._D3Axis(this.yAxisPosition()).scale(this.y);

    // Set the column names of the y series
    this._ySeriesNames = Object.keys(this.yValues.at(0));
    // Set the svg container of the chart
    this._setSvg();
    // Set the categories of the dataset
    this.categoriesValues = this.data().map((d) => this.categoriesSeries()(d));
    // Set the color schema
    this.colorScale().domain(
      // Unique values of the categories
      this.categoriesValues.filter((d, i, ns) => ns.indexOf(d) == i)
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
          y: r[d],
          category: this.categoriesValues.at(i),
        }))
      )
      .join("circle")
      .attr("class", (d) => `${d.serie.toLowerCase().replace(" ", "-")} point`)
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", this.radius())
      .style("fill", (d) => this.colorScale()(d.category));
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
   * const chart = new Chart()
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

    legendGroup
      .selectAll("rect")
      .data(this.colorScale().domain())
      .join("rect")
      .attr("class", (d) => `${d} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale()(d));

    legendGroup
      .selectAll("text")
      .data(this.colorScale().domain())
      .join("text")
      .attr("class", (d) => `${d} legend-name`)
      .attr("x", config.size + config.spacing)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .attr("dy", config.size)
      .text((d) => d)
      .style("fill", (d) => this.colorScale()(d));
  }
}
