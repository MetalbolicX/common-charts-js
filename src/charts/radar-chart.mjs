const { select, lineRadial, curveLinearClosed, format } = d3;

("use strict");

export default class RadarChart {
  #bindTo;
  #svg;
  #width;
  #height;
  #margin;
  #data;
  #xSerie;
  #ySeries;
  #yScale;
  #y;
  #xValues;
  #yValues;
  #ySeriesNames;
  #colorScale;
  #xAxisCustomizations;
  #yAxisCustomizations;
  #yAxisOffset;
  #axisTicks;
  #circleRadius;

  constructor() {
    this.#bindTo = "svg";
    this.#svg = undefined;
    this.#width = 800;
    this.#height = 600;
    this.#margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.#data = undefined;
    this.#xSerie = undefined;
    this.#ySeries = undefined;
    this.#yScale = undefined;
    this.#y = undefined;
    this.#xValues = undefined;
    this.#yValues = undefined;
    this.#ySeriesNames = undefined;
    this.#colorScale = undefined;
    this.#xAxisCustomizations = undefined;
    this.#yAxisCustomizations = undefined;
    this.#yAxisOffset = 0.05;
    this.#axisTicks = 3;
    this.#circleRadius = undefined;
  }

  /**
   * @description
   * Getter and setter for the svg element where the chart is displayed.
   * @param {string} selector The CSS selector of the svg where the chart will be drawn.
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new PolarRadarChart()
   *  .bindTo("svg.chart");
   * ```
   */
  bindTo(selector) {
    return arguments.length ? ((this.#bindTo = selector), this) : this.#bindTo;
  }

  /**
   * @description
   * Getter and setter for the height property.
   * @param {number|string} value The value of the height of the chart.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new RadarChart()
   *  .height(500);
   * ```
   */
  height(value) {
    return arguments.length ? ((this.#height = +value), this) : this.#height;
  }

  /**
   * @description
   * Getter and setter for the width property.
   * @param {number|string} value The value of the width of the chart.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new RadarChart()
   *  .width(500);
   * ```
   */
  width(value) {
    return arguments.length ? ((this.#width = +value), this) : this.#width;
  }

  /**
   * @description
   * Getter and setter for the margins properties of chart according to D3 js convention, see below.
   * @see {@link https://observablehq.com/@d3/margin-convention}
   * @param {object} margins The object literal for the configuration of the margins.
   * @param {number} margins.top The top margin pixels for the plot.
   * @param {number} margins.right The right margin pixels for the plot.
   * @param {number} margins.bottom The bottom margin pixels for the plot.
   * @param {number} margins.left The left margin pixels for the plot.
   * @returns {{top: number, right: number, bottom: number, left: number}|this}
   * @example
   * ```JavaScript
   * const chart = new RadarChart()
   *  .margin({
   *      top: 30,
   *      right: 50,
   *      bottom: 30,
   *      left: 50
   *   });
   * ```
   */
  margin(margins) {
    if (!arguments.length) {
      return this.#margin;
    }
    if (
      margins &&
      typeof margins === "object" &&
      "top" in margins &&
      "right" in margins &&
      "bottom" in margins &&
      "left" in margins
    ) {
      this.#margin = { ...margins };
    } else {
      console.error(
        "Invalid margin object. Must contain keys: top, right, bottom, and left."
      );
    }
    return this;
  }

  /**
   * @description
   * Getter and setter for the data to draw the chart.
   * @param {object[]} dataSet The dataset to draw the chart as an array of objects.
   * @returns {object[]|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .data([
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   *  ]);
   * ```
   */
  data(dataSet) {
    if (!arguments.length) {
      return this.#data;
    }
    if (
      Array.isArray(dataSet) &&
      dataSet.every((obj) => typeof obj === "object")
    ) {
      this.#data = [...dataSet];
    } else {
      throw new Error("The only dataset allowed is an array of objects");
    }
    return this;
  }

  /**
   * @description
   * Getter and setter a callback to iterate the x serie in the dataset.
   * @param {callback} fn The callback function to deal with the x serie.
   * @returns {callback|this}
   * @example
   * ```JavaScript
   * const chart = new RadarChart()
   *  .data([
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .xSerie((d) => d.date); // An anonymous function to iterate in the serie for x axis
   * ```
   */
  xSerie(fn) {
    return arguments.length ? ((this.#xSerie = fn), this) : this.#xSerie;
  }

  /**
   * @description
   * Getter and setter a callback to iterate the y series in the dataset.
   * @param {callback} fn The callback function to deal with the y series.
   * @returns {callback|this}
   * @example
   * ```JavaScript
   * const chart = new RadarChart()
   *  .data([
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .ySeries((d) => ({ // An anonymous function that returns an object with the series to draw in the chart
   *    europe: d.europe,
   *    asia: d.asia,
   *    america: d.america
   *  }));
   * ```
   */
  ySeries(fn) {
    return arguments.length ? ((this.#ySeries = fn), this) : this.#ySeries;
  }

  /**
   * @description
   * Add a percentage offset value to the maximum and minimum value for the domain limiits of the chart.
   * @param {number} percentage The pecentage number to offset the y axis minimum and maximum values. The value must be between 0 and 1.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new PolaroidChart()
   *  .yAxisOffset(0.05);
   * ```
   */
  yAxisOffset(percentage) {
    if (!arguments.length) {
      return this.#yAxisOffset;
    }

    // Check the range of the percentage number
    if (percentage >= 0 && percentage <= 1) {
      this.#yAxisOffset = +percentage;
    } else {
      console.error(
        "Invalid number. The only value allowed is between 0 and 1"
      );
    }
    return this;
  }

  /**
   * @description
   * Getter and setter for the D3 color for each serie.
   * @param {D3Scale} scale The D3 js scale to set the color for each numeric series.
   * @returns {callback|this}
   * @see {@link https://d3js.org/d3-scale-chromatic/categorical}
   * @example
   * ```JavaScript
   * const chart = new RadarChart()
   *  .colorScale(d3.scaleOrdinal().range(["black", "green", "blue"]));
   * ```
   */
  colorScale(scale) {
    return arguments.length
      ? ((this.#colorScale = scale), this)
      : this.#colorScale;
  }

  /**
   * @description
   * Set the svg element container for the chart.
   * @returns {void}
   * @protected
   */
  _setSvg() {
    const svgContainer = document.querySelector(this.bindTo());
    if (!svgContainer) {
      throw new Error("Cannot find SVG element container for the chart");
    }
    this.#svg = select(svgContainer);
  }

  /**
   * @description
   * Getter for the svg container of the chart.
   * @returns {D3Selection}
   * @protected
   */
  get _svg() {
    return this.#svg;
  }

  /**
   * @description
   * Obtain an object literat with the minimum and maximum values of the serie.
   * @param {number[]} serie Serie of values of the dataset.
   * @returns {{min: number, max: number}}
   * @protected
   */
  _serieRange(serie) {
    return {
      min: Math.min(...serie),
      max: Math.max(...serie),
    };
  }

  /**
   * @description
   * Show the array of names of all numeric series for the chart.
   * @param {string[]} names The array of names of all numeric series.
   * @returns {string[]|this}
   * @protected
   */
  _ySeriesNames(names) {
    return arguments.length
      ? ((this.#ySeriesNames = [...names]), this)
      : this.#ySeriesNames;
  }

  /**
   * @description
   * Getter and setter for the array of the x serie data.
   * @param {any[]} values The array of the x serie data.
   * @returns {any[]|this}
   * @protected
   */
  xValues(values) {
    return arguments.length
      ? ((this.#xValues = [...values]), this)
      : this.#xValues;
  }

  /**
   * @description
   * Getter and setter of data that forms y series to render in the chart.
   * @param {object[]} values The array of the y series data.
   * @returns {object[]|this}
   * @protected
   */
  yValues(values) {
    return arguments.length
      ? ((this.#yValues = [...values]), this)
      : this.#yValues;
  }

  /**
   * @description
   * Getter and setter for the quantity of ticks to draw in the chart.
   * @param {number|string} value The quantity of ticks for the circles to make the radar chart.
   * @returns {number|this}
   */
  axisTicks(value) {
    return arguments.length
      ? ((this.#axisTicks = +value), this)
      : this.#axisTicks;
  }

  /**
   * @description
   * Getter and setter for the D3 js scale function to configure the y series scale.
   * @param {D3Scale} scale The callback function to deal with the y series.
   * @returns {D3Scale|this}
   * @see {@link https://d3js.org/d3-scale}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .yScale(d3.scaleLinear());
   * ```
   */
  yScale(scale) {
    return arguments.length ? ((this.#yScale = scale), this) : this.#yScale;
  }

  /**
   * @description
   * Getter of the size of highest circle.
   * @returns {number}
   */
  get circleRadius() {
    return this.#circleRadius;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    const w = this.width() - this.margin().left - this.margin().right;
    const h = this.height() - this.margin().top - this.margin().bottom;
    const circleConstraint = Math.min(w, h);

    this._ySeriesNames = Object.keys(this.ySeries()(this.data().at(0)));
    // Set the color schema
    this.colorScale().domain(this._ySeriesNames);
    // Separate the values of categories and the numeric series
    this.xValues = this.data().map((d) => this.xSerie()(d));
    this.yValues = this.data().map((d) => this.ySeries()(d));
    // Find the highest value of all series
    const ySerieRange = this._serieRange(
      this.yValues.map((d) => Object.values(d)).flat()
    );
    // Add the radians to the series values
    const addRadians = this.yValues.map((d, i, ns) => ({
      ...d,
      radians: ((2 * Math.PI) / ns.length) * i,
    }));
    this.yValues = addRadians;
    // Set the scale of the radius
    this.y = this.yScale()
      .domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([0, circleConstraint / 2]);
    // Set the size of the circle radius
    this.#circleRadius = this.y.range().at(-1);
    // Select the svg element to bind chart
    this._setSvg();
    // Set the g element for centered
    this._svg
      .append("g")
      .attr("class", "main")
      .attr(
        "transform",
        `translate(${w / 2 + this.margin().left}, ${h / 2 + this.margin().top})`
      );
  }

  /**
   * @description
   * Add circles of axis for the radar chart.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js format function to format the data displayed in the label. By default the function is d3.format(".1f"). See the link for more details.
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart()
   *  ...;
   *
   * // Set a custom format for the postfix in a number
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * chart.init();
   * chart.addAxis(customUnits.format("$.1f"));
   * ```
   */
  addAxis(fnFormat = format(".1f")) {
    const ticks = Array.from({ length: this.axisTicks() }).map(
      (_, i) => (this.y.domain().at(-1) * i) / this.axisTicks()
    );

    const groupAxes = this._svg
      .select(".main")
      .append("g")
      .attr("class", "radial axes");

    const circlesGroup = groupAxes
      .selectAll(".axes.ticks")
      .data(ticks)
      .join("g")
      .attr("class", "axes ticks");
    // Draw the circles for the axis
    circlesGroup
      .append("circle")
      .attr("class", "x axis tick")
      .attr("r", (d) => this.y(d));
    // Add the meaning of the size per each axis circle
    circlesGroup
      .append("text")
      .attr("class", "x axis size")
      .attr("dy", (d) => this.y(d))
      .text((d) => fnFormat(d))
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Add lines per each category in the axis around the circle.
   * @return {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart()
   *  ...;
   *
   * chart.init();
   * chart.addAxisLines();
   * ```
   */
  addAxisLines() {
    const groupAxes = this._svg
      .select(".main")
      .append("g")
      .attr("class", "lines axes");

    groupAxes
      .selectAll("line")
      .data(this.yValues)
      .join("line")
      .attr("class", (_, i) => `${this.xValues.at(i)} axis`)
      .attr("x2", (d) => this.circleRadius * Math.sin(d.radians))
      .attr("y2", (d) => this.circleRadius * Math.cos(d.radians));

    groupAxes
      .selectAll("text")
      .data(this.yValues)
      .join("text")
      .attr("class", (_, i) => `${this.xValues.at(i)} label`)
      .attr("x", (d) => this.circleRadius * Math.sin(d.radians))
      .attr("y", (d) => -this.circleRadius * Math.cos(d.radians))
      .text((_, i) => this.xValues.at(i))
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Add the series of the radial chart.
   * @return {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart()
   *  ...;
   *
   * chart.init();
   * chart.addSeries();
   * ```
   */
  addSeries() {
    const seriesGroup = this._svg
      .select(".main")
      .append("g")
      .attr("class", "series");

    const pathsGroup = seriesGroup
      .selectAll("g")
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")}`);

    // Set the D3 js line radial generator for a serie os data to create the string svg path
    const pathGenerator = lineRadial()
      .radius((d) => this.y(d.value))
      .angle((d) => d.radian)
      .curve(curveLinearClosed);

    pathsGroup
      .append("path")
      .attr("class", (d) => `${d} serie`)
      .attr("d", (d) => {
        /** @type {{value: number, radian: number}[]}*/
        const serie = this.yValues.map((r) => ({
          value: r[d],
          radian: r.radians,
        }));
        return pathGenerator(serie);
      })
      .style("stroke", (d) => this.colorScale()(d));
  }

  /**
   * @description
   * Add the text labels of data of each serie.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js format function to format the data displayed in the label. By default the function is d3.format(".1f"). See the link for more details.
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart()
   *  ...;
   * // Set a custom format for the postfix in a number
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * chart.init();
   * chart.addLabels(customUnits.format("$.1f"));
   * ```
   */
  addLabels(fnFormat = format(".1f")) {
    const pathsSeries = this._svg.selectAll(".series > g path");

    pathsSeries.each((d, i, ns) => {
      const currentPath = select(ns[i]);
      /** @type {number[]} */
      const serie = this.yValues.map((r) => r[d]);
      const coordinates = this.#extractCoordinates(
        currentPath.attr("d"),
        serie
      );
      const parent = select(ns[i].parentElement);

      parent
        .selectAll("text")
        .data(coordinates)
        .join("text")
        .attr("class", (_, i) => `${d} ${this.xValues.at(i)} label`)
        .attr("x", (r) => r.x)
        .attr("y", (r) => r.y)
        .text((r) => fnFormat(r.value));
    });
  }

  /**
   * @description
   * From a svg path which was created using line radial, extract the x and y coordinates.
   * @param {string} svgPath The string of the SVG path element.
   * @param {number[]} serieValues The values of data points.
   * @returns {{x: number, y: number}[]}
   */
  #extractCoordinates(svgPath, serieValues) {
    const re = /[-+]?\d+(\.\d+)?/g;
    return svgPath
      .match(re)
      .map((match, i, matches) => {
        // Iterate to each pair of matches to rearrange the numbers in x and y
        // rectangular coordinates. Return null when the positioning is an odd number
        // Later the null's will be removed
        if (i % 2 === 0) {
          const x = +match;
          const y = +matches.at(i + 1);
          return { x, y };
        }
        return null;
      })
      .filter((match) => match)
      .map((match, i) => ({
        ...match,
        value: serieValues.at(i),
      }));
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
   * const chart = new RadarChart()
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
      .select(".main")
      .append("g")
      .attr("class", "legends")
      .attr(
        "transform",
        `translate(${config.widthOffset * this.circleRadius}, ${
          config.heightOffset * this.circleRadius
        })`
      );

    legendGroup
      .selectAll("rect")
      .data(this._ySeriesNames)
      .join("rect")
      .attr("class", (d) => `${d} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale()(d));

    legendGroup
      .selectAll("text")
      .data(this._ySeriesNames)
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
   * Add the title to the chart and configure the position of it.
   * @param {object} config The configuration object to add the title and position of the title in the chart.
   * @param {string} config.title The title of the chart.
   * @param {number} config.widthOffset The horizontal positioning in percentage of the title. Zero means closest to left of the screen. One means the farthest from the left of the screen. The number must be between 0 and 1.
   * @param {number} config.heightOffset The vertical positioning in percentage of the title. Zero means closest to top of the screen. One means the farthest from the top of the screen. The number must be between 0 and 1.
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart()
   *  ...;
   *
   * chart.init();
   * chart.addTitle({
   *    title: "Christmas sales perdiod",
   *     widthOffset: 0.5, // The title will be horizontally at the middle
   *    heightOffset: 0
   * });
   * ```
   */
  addTitle(config) {
    const titleGroup = this._svg.append("g").attr("class", "chart-title");
    titleGroup
      .append("text")
      .attr("x", this.width() * config.widthOffset)
      .attr("y", this.height() * config.heightOffset)
      .text(config.title)
      .style("text-anchor", "middle");
  }
}
