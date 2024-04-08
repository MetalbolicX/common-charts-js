const { select } = d3;

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
  #ySeries;
  #yScale;
  #y;
  #xValues;
  #yValues;
  #ySeriesNames;
  #colorScale;
  #yAxisOffset;

  constructor() {
    this.#bindTo = "svg";
    this.#svg = undefined;
    this.#width = 800;
    this.#height = 600;
    this.#margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.#data = undefined;
    this.#ySeries = undefined;
    this.#yScale = undefined;
    this.#y = undefined;
    this.#xValues = undefined;
    this.#yValues = undefined;
    this.#ySeriesNames = undefined;
    this.#colorScale = undefined;
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
    return arguments.length && typeof selector === "string"
      ? ((this.#bindTo = selector), this)
      : this.#bindTo;
  }

  /**
   * @description
   * Getter and setter for the height property.
   * @param {number} value The value of the height of the chart.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .height(500);
   * ```
   */
  height(value) {
    return arguments.length && value > 0
      ? ((this.#height = +value), this)
      : this.#height;
  }

  /**
   * @description
   * Getter and setter for the width property.
   * @param {number} value The value of the width of the chart.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .width(500);
   * ```
   */
  width(value) {
    return arguments.length && value > 0
      ? ((this.#width = +value), this)
      : this.#width;
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
   * @param {object[]} dataset The dataset to draw the chart as an array of objects.
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
  data(dataset) {
    if (!arguments.length) {
      return this.#data;
    }
    if (
      Array.isArray(dataset) &&
      dataset.every((obj) => typeof obj === "object")
    ) {
      this.#data = [...dataset];
    } else {
      throw new Error("The only dataset allowed is an array of objects");
    }
    return this;
  }

  /**
   * @description
   * Getter and setter a callback to iterate the y series in the dataset.
   * @param {(d: object) => any} fn The callback function to deal with the y series.
   * @returns {(d: object) => any|this}
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
   * @access @protected
   */
  _setSvg() {
    if (this.constructor === Chart) {
      console.error("Not access allowed");
      return;
    }
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
   * @access @protected
   */
  get _svg() {
    return this.#svg;
  }

  /**
   * @description
   * Obtain an object literat with the minimum and maximum values of the serie.
   * @param {number[]} serie Serie of values of the dataset.
   * @returns {{min: number, max: number}}
   * @access @protected
   */
  _serieRange(serie) {
    if (this.constructor === Chart) {
      console.error("Not access allowed");
      return;
    }
    return {
      min: Math.min(...serie),
      max: Math.max(...serie),
    };
  }

  /**
   * @description
   * Show the array of names of all numeric series for the chart.
   * @param {string[]} names The array of names of all numeric series.
   * @access @protected
   */
  set _ySeriesNames(names) {
    if (this.constructor !== Chart) {
      this.#ySeriesNames = [...names];
    } else {
      console.error(
        "Cannot modify protected property outside the class hierarchy"
      );
    }
  }

  /**
   * @description
   * Getter of the names of all numeric series for the chart.
   * @returns {string[]}
   */
  get _ySeriesNames() {
    return this.#ySeriesNames;
  }

  /**
   * @description
   * Setter of the D3 js scale function generator for the y to transform data.
   * @param {D3Scale} scale The D3 js scale for the y series.
   * @access @protected
   */
  set _y(scale) {
    if (this.constructor !== Chart) {
      this.#y = scale;
    } else {
      console.error(
        "Cannot modify protected property outside the class hierarchy"
      );
    }
  }

  /**
   * @description
   * Getter of the y scale generator of the chart.
   * @returns {D3Scale}
   */
  get y() {
    return this.#y;
  }

  /**
   * @description
   * Setter for the array of the x serie of data.
   * @param {any[]} values The array of the x serie data.
   * @access @protected
   */
  set _xValues(values) {
    if (this.constructor !== Chart) {
      this.#xValues = [...values];
    } else {
      console.error(
        "Cannot modify protected property outside the class hierarchy"
      );
    }
  }

  /**
   * @description
   * Getter for the array of the x serie of data.
   * @returns {any[]}
   */
  get xValues() {
    return this.#xValues;
  }

  /**
   * @description
   * Setter of data that forms y series to render in the chart.
   * @param {object[]} values The array of the y series data.
   * @access @protected
   */
  set _yValues(values) {
    if (this.constructor !== Chart) {
      this.#yValues = [...values];
    } else {
      console.error(
        "Cannot modify protected property outside the class hierarchy"
      );
    }
  }

  /**
   * @description
   * Getter for the array of the y values of data.
   * @returns {object[]}
   */
  get yValues() {
    return this.#yValues;
  }
}
