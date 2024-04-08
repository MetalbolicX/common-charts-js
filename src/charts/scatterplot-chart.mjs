import RectangularChart from "./rectangular-chart.mjs";

("use strict");

export default class ScatterPlot extends RectangularChart {
  #radius;
  #categorySerie;
  #categoryValues;
  #serieToShow;
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
   * Getter and setter for the series to be rendered in the chart.
   * @param {string} serieName Name of the serie in the dateset to show the slices in the chart.
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
   *  .serieToShow("income");
   * ```
   */
  serieToShow(serieName) {
    return arguments.length && typeof serieName === "string"
      ? ((this.#serieToShow = serieName), this)
      : this.#serieToShow;
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
   *  .categorySerie((d) => department: d.department); // An anonymous function that returns an object with the series of categories in the dataset
   * ```
   */
  categorySerie(fn) {
    return arguments.length
      ? ((this.#categorySerie = fn), this)
      : this.#categorySerie;
  }

  /**
   * @description
   * Setter for the categories in the dataset.
   * @param {any[]} values The array of values for categories in the dataset.
   * @access @protected
   */
  set _categoryValues(values) {
    if (Array.isArray(values) && values.every((d) => typeof d === "string")) {
      this.#categoryValues = [...values];
    } else {
      console.error("Invalid input values. It must be an array of strings");
    }
  }

  /**
   * @description
   * Getter for the categories values in the dataset.
   * @return {any[]}
   */
  get categoryValues() {
    return this.#categoryValues;
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
   * const chart = new ScatterPlot()
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

  /**
   * @description
   * Group the dataset as and object of arrays.
   * @param {any[]} dataset A dataset of data as list of object.
   * @param {(d: object) => any} fn A callback function with the field name to iterate through the dataset.
   * @returns {object}
   */
  groupBy(dataset, fn) {
    return dataset.reduce(
      (group, d) => ({
        ...group,
        [fn(d)]: (group[fn(d)] ?? []).concat(d),
      }),
      {}
    );
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
    /**
     * @description
     * Dataset rearranged using group by style
     * @type {{[key: string]: any[]}}
     */
    const categories = this.groupBy(this.data(), this.categorySerie());

    /**
     * @description
     * The calculations of least squares sum in a dataset per category.
     * @type {{category: string, totals: {x: number, xSquare: number, y: number, xy: number, n: number, xMin: number, xMax: number}}[]}
     */
    const leastSquares = Object.keys(categories).map((key) => ({
      category: key,
      totals: {
        x: categories[key].reduce((acc, d) => acc + this.xSerie()(d), 0),
        xSquare: categories[key].reduce(
          (acc, d) => acc + this.xSerie()(d) ** 2,
          0
        ),
        y: categories[key]
          .map((d) => this.ySeries()(d))
          .reduce((acc, d) => acc + d, 0),
        xy: categories[key]
          .map((d) => this.xSerie()(d) * this.ySeries()(d))
          .reduce((acc, d, i) => acc + d, 0),
        n: categories[key].length,
        xMin: categories[key].reduce(
          (acc, d) => Math.min(acc, this.xSerie()(d)),
          Infinity
        ),
        xMax: categories[key].reduce(
          (acc, d) => Math.max(acc, this.xSerie()(d)),
          Number.NEGATIVE_INFINITY
        ),
      },
    }));

    /**
     * @description
     * An array with parameters to calculate the slope linear function between two points per category.
     * @type {{category: string, xMax: number, xMin: number, slope: number, b: number}[]}
     */
    const slopes = leastSquares.map((d) => {
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

    /**
     * @description
     * The array of coordinates to draw a line per category.
     * @type {{category: string, xMin: number, xMax: number, yMax: number, yMin: number}[]}
     */
    const coordinates = slopes.map((d) => ({
      category: d.category,
      xMin: d.xMin,
      xMax: d.xMax,
      yMin: d.slope * d.xMin + d.b,
      yMax: d.slope * d.xMax + d.b,
    }));

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
      .style("stroke", (d) => this.colorScale()(d.category));
  }
}
