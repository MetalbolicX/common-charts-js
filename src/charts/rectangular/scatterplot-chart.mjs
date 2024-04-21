import RectangularChart from "./rectangular-chart.mjs";

("use strict");

const { scaleOrdinal } = d3;

export default class ScatterPlot extends RectangularChart {
  #radius;
  #categoryConfiguration;
  /**
   * @description
   * The array of objects with the parameters to calculate the line equation between two points.
   * @type {{category: string, xMax: number, xMin: number, slope: number, b: number}[]}
   */
  #slopes;
  constructor() {
    super();
    this.#radius = 1;
    this.#slopes = undefined;
    this.#categoryConfiguration = undefined;
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
   * @param {object} config The configuration object of the serie that contains the categories in the dataset.
   * @param {string} config.serie The name of the serie to iterate the categories.
   * @param {string[]} config.colors The colors to set each category.
   * @returns {{serie: string, colors: string[]}|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
   *  .categoryConfiguration({
   *    serie: "group",
   *    colors: ["black", "green", "yellow"]
   *  });
   * ```
   */
  categoryConfiguration(config) {
    if (!arguments.length) {
      return this.#categoryConfiguration;
    }
    if (
      typeof config === "object" &&
      typeof config.serie === "string" &&
      config.colors.every((color) => typeof color === "string")
    ) {
      this.#categoryConfiguration = { ...config };
    } else {
      console.error(`Invalid configuration object ${config}`);
    }
    return this;
  }

  /**
   * @description
   * Getter of the slopes parameters for the line equation of the least squares method.
   * @returns {{category: string, xMax: number, xMin: number, slope: number, b: number}[]}
   */
  get slopes() {
    return this.#slopes;
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
   * The transformed data to draw in the chart.
   * @param {object} row A row of data in the dataset.
   * @param {string} serie The name of the serie to get the value.
   * @returns {{serie: string, x: number, y: number, category: string}}
   */
  getSerie(row, serie) {
    return {
      serie,
      x: row[this.xConfiguration().serie],
      y: row[serie],
      category: row[this.categoryConfiguration().serie],
    };
  }

  /**
   * @description
   * Creates the data points in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new ScatterPlot()
   *  ...;
   *
   * chart.init();
   * char.addAllSeries();
   * ```
   */
  addAllSeries() {
    const seriesGroup = this._svg.append("g").attr("class", "series");
    seriesGroup
      .selectAll(".serie")
      .data(this.ySeries)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    seriesGroup
      .selectAll(".serie")
      .selectAll("circle")
      .data((d) => this.data().map((row) => this.getSerie(row, d)))
      .join("circle")
      .attr("class", (d) => `${d.serie.toLowerCase().replace(" ", "-")} point`)
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", this.radius())
      .style("fill", (d) => this.colorScale(d.category));
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
   * const chart = new ScatterPlot()
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
      .data(this.colorScale.domain())
      .join("rect")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale(d));

    legendGroup
      .selectAll("text")
      .data(this.colorScale.domain())
      .join("text")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend-name`)
      .attr("x", config.size + config.spacing)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .attr("dy", config.size)
      .text((d) => d)
      .style("fill", (d) => this.colorScale(d));
  }

  /**
   * @description
   * Group the dataset as and object of arrays.
   * @param {any[]} dataset A dataset of data as list of object.
   * @param {string} serie The name of the serie to group by.
   * @returns {{[key: string]: any[]}}
   */
  groupBy(dataset, serie) {
    return dataset.reduce(
      (group, row) => ({
        ...group,
        [row[serie]]: (group[row[serie]] ?? []).concat(row),
      }),
      {}
    );
  }

  /**
   * @description
   * The calculations of least squares sum in a dataset per category.
   * @param {{[key: string]: any[]}} group A grouped dataset by a categorical data as keys and values are the tuples of each category.
   * @returns {{category: string, totals: {x: number, xSquare: number, y: number, xy: number, n: number, xMin: number, xMax: number}}[]}
   * @see {@link https://www.varsitytutors.com/hotmath/hotmath_help/spanish/topics/line-of-best-fit}
   *
   */
  leastSquares(group) {
    return Object.keys(group).map((key) => ({
      category: key,
      totals: {
        x: group[key].reduce(
          (acc, d) => acc + d[this.xConfiguration().serie],
          0
        ),
        xSquare: group[key].reduce(
          (acc, d) => acc + d[this.xConfiguration().serie] ** 2,
          0
        ),
        y: group[key]
          .map((d) => d[this.ySeries.at(0)])
          .reduce((acc, d) => acc + d, 0),
        xy: group[key]
          .map((d) => d[this.xConfiguration().serie] * d[this.ySeries.at(0)])
          .reduce((acc, d, i) => acc + d, 0),
        n: group[key].length,
        xMin: group[key].reduce(
          (acc, d) => Math.min(acc, d[this.xConfiguration().serie]),
          Infinity
        ),
        xMax: group[key].reduce(
          (acc, d) => Math.max(acc, d[this.xConfiguration().serie]),
          Number.NEGATIVE_INFINITY
        ),
      },
    }));
  }

  /**
   * @description
   * Calculate the terms of the line equation between two points. Using the data of least square method.
   * @param {{category: string, totals: {x: number, xSquare: number, y: number, xy: number, n: number, xMin: number, xMax: number}}[]} leastSquare The calculations of the sums for the least square method per category.
   * @returns {{category: string, xMax: number, xMin: number, slope: number, b: number}[]}
   */
  calculateSlopes(leastSquare) {
    return leastSquare.map((d) => {
      /**
       * @description
       * The calculation of the slope for the line equation.
       * @type {number}
       */
      const slope =
        (d.totals.xy - (d.totals.x * d.totals.y) / d.totals.n) /
        (d.totals.xSquare - d.totals.x ** 2 / d.totals.n);
      return {
        category: d.category,
        xMax: d.totals.xMax,
        xMin: d.totals.xMin,
        slope,
        b: (d.totals.y - slope * d.totals.x) / d.totals.n,
      };
    });
  }

  /**
   * @description
   * Compute the coordinates of the line equation between two points of the line created from the least squares.
   * @param {{category: string, xMax: number, xMin: number, slope: number, b: number}[]} slopes The array of coordinates to draw a line per category.
   * @returns {{category: string, xMin: number, xMax: number, yMax: number, yMin: number}[]}
   */
  calculateCoordinates(slopes) {
    return slopes.map((d) => ({
      category: d.category,
      xMin: d.xMin,
      xMax: d.xMax,
      yMin: d.slope * d.xMin + d.b,
      yMax: d.slope * d.xMax + d.b,
    }));
  }

  /**
   * @description
   * Adds a trending line from the calculations of the least squares per category.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new ScatterPlot()
   *  ...;
   *
   * chart.init();
   * char.addTrendingLines();
   * ```
   */
  addTrendingLines() {
    const categories = this.groupBy(
      this.data(),
      this.categoryConfiguration().serie
    );
    const leastSquaresCalcs = this.leastSquares(categories);
    this.#slopes = this.calculateSlopes(leastSquaresCalcs);
    const coordinates = this.calculateCoordinates(this.slopes);

    const seriesGroup = this._svg.select(".series");
    seriesGroup
      .selectAll("g")
      .selectAll("line")
      .data(coordinates)
      .join("line")
      .attr(
        "class",
        (d) => `${d.category.toLowerCase().replace(" ", "-")} tendency`
      )
      .attr("x1", (d) => this.x(d.xMin))
      .attr("y1", (d) => this.y(d.yMin))
      .attr("x2", (d) => this.x(d.xMax))
      .attr("y2", (d) => this.y(d.yMax))
      .style("stroke", (d) => this.colorScale(d.category));
  }
}
