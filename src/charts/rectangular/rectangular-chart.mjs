import Chart from "../chart.mjs";

("use strict");

const { axisTop, axisRight, axisBottom, axisLeft, format } = d3;

export default class RectangularChart extends Chart {
  #xAxis;
  #yAxis;
  #yAxisConfiguration;
  #xAxisConfiguration;
  #x;
  #xConfiguration;

  constructor() {
    super();
    this.#xAxis = undefined;
    this.#yAxis = undefined;
    this.#x = undefined;
    this.#xConfiguration = undefined;
    this.#yAxisConfiguration = {
      position: "left",
      customizations: { tickFormat: format(".1f") },
    };
    this.#xAxisConfiguration = {
      position: "bottom",
      customizations: { tickFormat: format(".1f") },
    };
  }

  /**
   * @description
   * Getter and setter of the configuration of the x values to draw in the chart.
   * @param {object} config The configuration to give to the x values series.
   * @param {string} config.serieName The names of the serie for the x axis.
   * @param {D3Scale} config.scale The D3 js function to process the x data.
   * @returns {{serieName: string, scale: () => any}|this}
   * @example
   * ```JavaScript
   * const chart = new RectangularChart()
   *  .xConfiguration({
   *    serieName: "date",
   *    scale: d3.scaleLinear()
   *  });
   * ```
   */
  xConfiguration(config) {
    if (!arguments.length) {
      return this.#xConfiguration;
    }
    if (typeof config === "object") {
      this.#xConfiguration = { ...config };
    } else {
      console.error(
        `Invalid configuration of the object ${config}, verifiy the documentation`
      );
    }
    return this;
  }

  /**
   * @description
   * Getter and setter of the configuration of the y axis.
   * @param {object} config Configuration object of the y axis position and customizations.
   * @param {string} config.position The position of the y axis. It can only be top, right, bottom or left inputs.
   * @param {object} config.customizations The customizations of the y axis according to the D3 js axis.
   * @returns {{position: string, customizations: object}|this}
   * @see {@link https://d3js.org/d3-scale}
   * @example
   * ```JavaScript
   * const chart = new RectangularChart()
   *  .yAxisConfig({
   *    position: "right",
   *    customizations: { tickFormat: d3.format(".1f") }
   * });
   * ```
   */
  yAxisConfig(config) {
    if (!arguments.length) {
      return this.#yAxisConfiguration;
    }
    if (
      ["top", "right", "bottom", "left"].includes(config.position ?? "left")
    ) {
      this.#yAxisConfiguration = { ...config };
    } else {
      console.error(`Invalid yAxis configuration object ${config}`);
    }
    return this;
  }

  /**
   * @description
   * Getter and setter of the configuration of the x axis.
   * @param {object} config Configuration object of the x axis position and customizations.
   * @param {string} config.position The position of the x axis. It can only be top, right, bottom or left inputs.
   * @param {object} config.customizations The customizations of the x axis according to the D3 js axis.
   * @returns {{position: string, customizations: object}|this}
   * @see {@link https://d3js.org/d3-scale}
   * @example
   * ```JavaScript
   * const chart = new RectangularChart()
   *  .xAxisConfig({
   *    position: "top",
   *    customizations: { tickFormat: d3.format(".1f") }
   * });
   * ```
   */
  xAxisConfig(config) {
    if (!arguments.length) {
      return this.#xAxisConfiguration;
    }
    if (
      ["top", "right", "bottom", "left"].includes(config.position ?? "bottom")
    ) {
      this.#xAxisConfiguration = { ...config };
    } else {
      console.error(`Invalid yAxis configuration object ${config}`);
    }
    return this;
  }

  /**
   * @description
   * Set the D3 axis function according to its position.
   * @param {string} position The position of the axis.
   * @returns {D3Axis}
   * @access @protected
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
   * Setter of the D3 axis generator.
   * @param {D3Axis} axis The D3 js axis generator.
   * @access @protected
   */
  set _xAxis(axis) {
    this.#xAxis = axis;
  }

  /**
   * @description
   * Getter of the D3 axis generator of x axis.
   * @return {D3Axis}
   */
  get xAxis() {
    return this.#xAxis;
  }

  /**
   * @description
   * Setter of the D3 axis generator.
   * @param {D3Axis} axis The D3 js axis generator.
   * @access @protected
   */
  set _yAxis(axis) {
    this.#yAxis = axis;
  }

  /**
   * @description
   * Getter of the D3 axis generator.
   * @return {D3Axis}
   */
  get yAxis() {
    return this.#yAxis;
  }

  /**
   * @description
   * Setter of the D3 js x scale to transform data in pixels size.
   * @param {D3Scale} scale The D3 js scale for the x serie.
   * @access @protected
   */
  set _x(scale) {
    this.#x = scale;
  }

  /**
   * @description
   * Getter of the D3 js y scale to transform data in pixels size.
   * @returns {D3Scale}
   */
  get x() {
    return this.#x;
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
   * const chart = new RectangularChart()
   *  ...;
   *
   * chart.init();
   * chart.addXAxis();
   * ```
   */
  addXAxis() {
    const translation = this.#translateAxis(this.xAxisConfig().position);
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
   * const chart = new RectangularChart()
   *  ...;
   *
   * chart.init();
   * chart.addYAxis();
   * ```
   */
  addYAxis() {
    const translation = this.#translateAxis(this.yAxisConfig().position);
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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
   * const chart = new RectangularChart()
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