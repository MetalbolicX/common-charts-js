const { axisTop, axisRight, axisBottom, axisLeft, select, format } = d3;

("use strict");

/**
 * @description
 * Chart is a class to set a basic D3 js chart.
 * @class
 */
export default class Chart {
  #bindTo;
  #svg;
  #width;
  #height;
  #margin;
  #data;
  #xSerie;
  #ySeries;
  #xScale;
  #yScale;
  #x;
  #y;
  #xValues;
  #yValues;
  #ySeriesNames;
  #xAxis;
  #yAxis;
  #xAxisPosition;
  #yAxisPosition;
  #colorScale;
  #xAxisCustomizations;
  #yAxisCustomizations;
  #yAxisOffset;

  constructor() {
    this.#bindTo = "svg";
    this.#svg = undefined;
    this.#width = 800;
    this.#height = 600;
    this.#margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.#data = undefined;
    this.#xSerie = undefined;
    this.#ySeries = undefined;
    this.#xScale = undefined;
    this.#yScale = undefined;
    this.#x = undefined;
    this.#y = undefined;
    this.#xValues = undefined;
    this.#yValues = undefined;
    this.#ySeriesNames = undefined;
    this.#xAxis = undefined;
    this.#yAxis = undefined;
    this.#xAxisPosition = "bottom";
    this.#yAxisPosition = "left";
    this.#colorScale = undefined;
    this.#xAxisCustomizations = { tickFormat: format(".1f") };
    this.#yAxisCustomizations = { tickFormat: format(".1f") };
    this.#yAxisOffset = 0.05;
  }

  /**
   * @description
   * Getter and setter for the svg element where the chart is displayed.
   * @param {string} selector The CSS selector of the svg where the chart will be drawn.
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
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
   * const chart = new Chart()
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
   * const chart = new Chart()
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
   * const chart = new Chart()
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
   * const chart = new Chart()
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
   * Getter and setter for the D3 js scale function to configure the x serie scale.
   * @param {D3Scale} scale The callback function to deal with the x serie.
   * @returns {D3Scale|this}
   * @see {@link https://d3js.org/d3-scale}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .xScale(d3.scaleTime());
   * ```
   */
  xScale(scale) {
    return arguments.length ? ((this.#xScale = scale), this) : this.#xScale;
  }

  /**
   * @description
   * Getter and setter a callback to iterate the y series in the dataset.
   * @param {callback} fn The callback function to deal with the y series.
   * @returns {callback|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
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
   * Add a percentage offset value to the maximum and minimum value for the domain limiits of the chart.
   * @param {number} percentage The pecentage number to offset the y axis minimum and maximum values. The value must be between 0 and 1.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
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
   * const chart = new Chart()
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
   * @returns {string[]}
   * @protected
   */
  _ySeriesNames(names) {
    return arguments.length
      ? ((this.#ySeriesNames = [...names]), this)
      : this.#ySeriesNames;
  }

  /**
   * @description
   * Set the D3 axis function according to its position.
   * @param {string} position The position of the axis.
   * @returns {D3Axis}
   * @protected
   */
  _D3Axis(position) {
    /** @enum {D3Axis} */
    const axisPositions = {
      top: axisTop(),
      right: axisRight(),
      bottom: axisBottom(),
      left: axisLeft(),
    };
    return axisPositions[position] || axisBottom();
  }

  /**
   * @description
   * Getter and setter of the D3 axis generator.
   * @param {D3Axis} axis The D3 js axis generator.
   * @returns {D3Axis}
   * @protected
   */
  xAxis(axis) {
    return arguments.length ? ((this.#xAxis = axis), this) : this.#xAxis;
  }

  /**
   * @description
   * Getter and setter of the x axis position.
   * @param {string} position The position of the axis. Only admit the values of "top", "right", "bottom" or "left".
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .xAxisPosition("bottom");
   * ```
   */
  xAxisPosition(position) {
    if (!arguments.length) {
      return this.#xAxisPosition;
    }
    // Check if the argument is a valid string
    if (
      typeof position === "string" &&
      ["top", "right", "bottom", "left"].includes(position)
    ) {
      this.#xAxisPosition = position;
    } else {
      console.error(
        "Invalid xAxisPosition. Must be one of: top, right, bottom, or left."
      );
    }
    return this;
  }

  /**
   * @description
   * Getter and setter for the x format customization. To check more about the D3 axis customizations see the link.
   * @param {object} config The object with the necessary customizations for the x axis. The Key are the name of the customizations and the value is the customization.
   * @returns {object|this}
   * @see {@link https://d3js.org/d3-axis}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .xAxisCustomizations({
   *    tickFormat: d3.format(",.0f"),
   *    tickValues: [1, 2, 3, 5, 8, 13, 21]
   *  });
   * ```
   */
  xAxisCustomizations(config) {
    return arguments.length
      ? ((this.#xAxisCustomizations = { ...config }), this)
      : this.#xAxisCustomizations;
  }

  /**
   * @description
   * Getter and setter for the y format customization. To check more about the D3 axis customizations see the link.
   * @param {object} config The object with the necessary customizations for the y axis. The Key are the name of the customizations and the value is the customization.
   * @returns {object|this}
   * @see {@link https://d3js.org/d3-axis}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .yAxisCustomizations({
   *    tickFormat: d3.format(",.0f"),
   *    tickValues: [1, 2, 3, 5, 8, 13, 21]
   *  });
   * ```
   */
  yAxisCustomizations(config) {
    return arguments.length
      ? ((this.#yAxisCustomizations = { ...config }), this)
      : this.#yAxisCustomizations;
  }

  /**
   * @description
   * Getter and setter of the y axis position.
   * @param {string} position The position of the axis. Only admit the values of "top", "right", "bottom" or "left".
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .yAxisPositiont("height");
   * ```
   */
  yAxisPosition(position) {
    if (!arguments.length) {
      return this.#yAxisPosition;
    }
    // Check if the argument is a valid string
    if (
      typeof position === "string" &&
      ["top", "right", "bottom", "left"].includes(position)
    ) {
      this.#yAxisPosition = position;
    } else {
      console.error(
        "Invalid xAxisPosition. Must be one of: top, right, bottom, or left."
      );
    }
    return this;
  }

  /**
   * @description
   * Getter and setter of the D3 axis generator.
   * @param {D3Axis} axis The D3 js axis generator.
   * @returns {D3Axis}
   * @protected
   */
  yAxis(axis) {
    return arguments.length ? ((this.#yAxis = axis), this) : this.#yAxis;
  }

  /**
   * @description
   * Getter and setter of the D3 js x scale to transform data in pixels size.
   * @param {D3Scale} scale The D3 js scale for the x serie.
   * @returns {D3Scale}
   * @protected
   */
  x(scale) {
    return arguments.length ? ((this.#x = scale), this) : this.#x;
  }

  /**
   * @description
   * Getter and setter of the D3 js y scale to transform data in pixels size.
   * @param {D3Scale} scale The D3 js scale for the y series.
   * @returns {D3Scale}
   * @protected
   */
  y(scale) {
    return arguments.length ? ((this.#y = scale), this) : this.#y;
  }

  /**
   * @description
   * Getter and setter for the array of the x serie data.
   * @param {any[]} values The array of the x serie data.
   * @returns {any[]}
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
   * @returns {object[]}
   * @protected
   */
  yValues(values) {
    return arguments.length
      ? ((this.#yValues = [...values]), this)
      : this.#yValues;
  }

  /**
   * @description
   * Set the string of translation value of the axis to be translated.
   * @param {string} position The position to set the axis.
   * @returns {string}
   */
  #translateAxis(position) {
    /** @enum {string} */
    const translations = {
      top: `translate(0, ${this.margin().top})`,
      right: `translate(${this.width() - this.margin().right}, 0)`,
      bottom: `translate(0, ${this.height() - this.margin().bottom})`,
      left: `translate(${this.margin().left}, 0)`,
    };
    return (
      translations[position] ||
      `translate(0, ${this.height() - this.margin().bottom})`
    );
  }

  /**
   * @description
   * Add the x axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.addXAxis();
   * ```
   */
  addXAxis() {
    const translation = this.#translateAxis(this.xAxisPosition());
    this._svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", translation)
      .call(this.xAxis);
  }

  /**
   * @description
   * Add the y axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.addYAxis();
   * ```
   */
  addYAxis() {
    const translation = this.#translateAxis(this.yAxisPosition());
    this._svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", translation)
      .call(this.yAxis);
  }

  /**
   * @description
   * Add the grid of the x axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.xGrid();
   * ```
   */
  xGrid() {
    const xGridGroup = this._svg.append("g").attr("class", "x grid");
    xGridGroup
      .selectAll("line")
      .data(this.x.ticks())
      .join("line")
      .attr("x1", (d) => this.x(d))
      .attr("y1", this.y(this.y.domain().at(0)))
      .attr("x2", (d) => this.x(d))
      .attr("y2", this.y(this.y.domain().at(-1)));
  }

  /**
   * @description
   * Add the grid of the y axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.yGrid();
   * ```
   */
  yGrid() {
    const yGridGroup = this._svg.append("g").attr("class", "y grid");
    yGridGroup
      .selectAll("line")
      .data(this.y.ticks())
      .join("line")
      .attr("x1", this.x(this.x.domain().at(0)))
      .attr("y1", (d) => this.y(d))
      .attr("x2", this.x(this.x.domain().at(-1)))
      .attr("y2", (d) => this.y(d));
  }

  /**
   * @description
   * An arrow at the end of the x axis.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.xAxisArrow();
   * ```
   */
  xAxisArrow() {
    const arrowGroup = this._svg
      .selectAll(".axis.arrows")
      .data([null])
      .join("g")
      .attr("class", "axis arrows");

    arrowGroup
      .append("path")
      .attr("class", "x axis arrow")
      .attr("d", () => {
        const x1 = this.x(this.x.domain().at(-1));
        const x2 = this.x(this.x.domain().at(-1)) + 7;
        const y2 = this.y(this.y.domain().at(0));
        const y1 = y2 - 3;
        const y3 = y2 + 3;
        return `M${x1},${y1},${x2},${y2},${x1},${y3}`;
      });
  }

  /**
   * @description
   * Add the arrow of the y axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.yAxisArrow();
   * ```
   */
  yAxisArrow() {
    const arrowGroup = this._svg
      .selectAll(".axis.arrows")
      .data([null])
      .join("g")
      .attr("class", "axis arrows");

    arrowGroup
      .append("path")
      .attr("class", "y axis arrow")
      .attr("d", () => {
        const y1 = this.y(this.y.domain().at(-1));
        const y2 = this.y(this.y.domain().at(-1)) - 7;
        const x2 = this.x(this.x.domain().at(0));
        const x1 = x2 - 3;
        const x3 = x2 + 3;
        return `M${x1},${y1},${x2},${y2},${x3},${y1}`;
      });
  }

  /**
   * @description
   * Render the x axis title in the chart.
   * @param {object} [config={title: "[x axis]", widthOffset: 0.5, deltaX: 0, deltaY: 0}] The x axis configuration object for the name of the axis.
   * @param {string} config.title The name of the x axis. By default the name is "[x axis]".
   * @param {number} config.widthOffset The percentage of the width to position the axis name. The value must be between 0 and 1. The 0 value is closest to the left of the screen. By default the value is 0.5 (50%).
   * @param {number} config.deltaX A small offset in pixels to reposition horizontally the name of the x axis in case it required. By default the value is 0.
   * @param {number} config.deltaY A small offset in pixels to reposition the name vertically of the x axis in case it required. By default the value is 0.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.xAxisName({
   *    title: "Years",
   *    widthOffset: 0.5,
   *    deltaX: 0,
   *    deltaY: 0
   * });
   * ```
   */
  xAxisName(
    config = {
      title: "[x axis]",
      widthOffset: 0.5,
      deltaX: 0,
      deltaY: this.margin().bottom,
    }
  ) {
    const axisNameGroup = this._svg
      .selectAll(".axes-name")
      .data([null])
      .join("g")
      .attr("class", "axes-name");

    axisNameGroup
      .append("text")
      .attr("class", "x axis-name")
      .attr("x", config.widthOffset * this.width())
      .attr(
        "y",
        this.xAxisPosition() === "bottom"
          ? this.height() - this.margin().bottom
          : this.margin().top
      )
      .attr("dx", config.deltaX)
      .attr("dy", config.deltaY)
      .text(config.title);
  }

  /**
   * @description
   * Render the y axis title in the chart.
   * @param {object} [config={title: "[y axis]", heightOffset: 0.5, deltaX: 0, deltaY: 0}] The y axis configuration object for the name of the axis.
   * @param {string} config.title The name of the x axis. By default the name is "[y axis]".
   * @param {number} config.heightOffset The percentage of the height to position the axis name. The value must be between 0 and 1. The 0 value is closest to the top of the screen. By default the value is 0.5 (50%).
   * @param {number} config.deltaX A small offset in pixels to reposition horizontally the name of the x axis in case it required. By default the value is 0.
   * @param {number} config.deltaY A small offset in pixels to reposition the name vertically of the x axis in case it required. By default the value is 0.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart()
   *  ...;
   *
   * chart.init();
   * chart.yAxisName({
   *    title: "Temperature",
   *    heightOffset: 0.5,
   *    deltaX: 0,
   *    deltaY: 0
   * });
   * ```
   */
  yAxisName(
    config = { title: "[y axis]", heightOffset: 0.5, deltaX: 0, deltaY: 0 }
  ) {
    const axisNameGroup = this._svg
      .selectAll(".axes-name")
      .data([null])
      .join("g")
      .attr("class", "axes-name");

    axisNameGroup
      .append("text")
      .attr("class", "y axis-name")
      .attr("transform", "rotate(-90)")
      .attr("x", -this.height() * config.heightOffset)
      .attr(
        "y",
        this.yAxisPosition() === "left"
          ? this.margin().left
          : this.width() - this.margin().right
      )
      .attr("dx", config.deltaX)
      .attr("dy", config.deltaY)
      .text(config.title);
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
   * const chart = new Chart()
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
}
