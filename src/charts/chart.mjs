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
  #yConfiguration;
  #y;
  #yAxisOffset;
  #colorScale;
  #ySeries;
  #seriesShown;

  constructor() {
    this.#bindTo = "svg";
    this.#svg = undefined;
    this.#width = 800;
    this.#height = 600;
    this.#margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.#data = undefined;
    this.#yAxisOffset = 0.05;
    this.#yConfiguration = undefined;
    this.#colorScale = undefined;
    this.#ySeries = undefined;
    this.#seriesShown = undefined;
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
   * Getter and setter of the configuration of the y numerical values to draw in the chart.
   * @param {object} config The configuration to give to the y (numerical) values series.
   * @param {string[]} config.colorSeries The string of the color to classify a each of the datasets.
   * @param {D3Scale} config.scale The D3 js function to process the numerical data.
   * @returns {{colorSeries: string[], scale: () => any}|this}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .yConfiguration({
   *    colorSeries: ["black", "pink", "#aaa"]
   *    scale: d3.scaleLinear()
   *  });
   * ```
   */
  yConfiguration(config) {
    if (!arguments.length) {
      return this.#yConfiguration;
    }
    if (
      typeof config === "object" &&
      config.colorSeries.every((serie) => typeof serie === "string")
    ) {
      this.#yConfiguration = { ...config };
    } else {
      console.error(
        `Invalid configuration of the object ${config}, verifiy the documentation`
      );
    }
    return this;
  }

  /**
   * @description
   * Setter of the y numerical series names of the dataset.
   * @param {string[]} series The list of names of the y series
   * @access @protected
   */
  set _ySeries(series) {
    if (series.every((serie) => typeof serie === "string")) {
      this.#ySeries = [...series];
    } else {
      console.error("The name of the y series must be a string");
    }
  }

  /**
   * @description
   * Getter of the y series.
   * @return {string[]}
   */
  get ySeries() {
    return this.#ySeries;
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
   * Setter of the D3 js scale function generator for the y to transform data.
   * @param {D3Scale} scale The D3 js scale for the y series.
   * @access @protected
   */
  set _y(scale) {
    this.#y = scale;
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
   * Setter of the color scale D3 js scale for the color.
   * @param {D3Scale} scale The D3 js scale for the color.
   * @access @protected
   */
  set _colorScale(scale) {
    this.#colorScale = scale;
  }

  /**
   * @description
   * Getter of the color scale generator of the chart.
   * @returns {D3Scale}
   */
  get colorScale() {
    return this.#colorScale;
  }

  /**
   * @description
   * Transform a row of the dataset into just numerical series data.
   * @param {object} row An object of the dataset for the chart.
   * @param {string[]} columnsToExclude The names of columns to exclude for the numerical fields.
   * @access @protected
   * @returns {object.<string, number>}
   */
  _getNumericalRow(row, columnsToExclude) {
    return Object.entries(row)
      .filter(([key, _]) => !columnsToExclude.includes(key) && key.length)
      .reduce((group, [key, value]) => ({ ...group, [key]: value }), {});
  }

  /**
   * @description
   * Setter for the series display in the chart.
   * @param {string[]} series The series to show in the chart.
   * @access @protected
   * @returns {void}
   */
  set _seriesShown(series) {
    if (series.length && series.every((serie) => typeof serie === "string")) {
      this.#seriesShown = series;
    } else {
      console.error("Only accepts an array of strings");
    }
  }

  /**
   * @description
   * Getter of the series to be shown in the chart.
   * @returns {string[]}
   */
  get seriesShown() {
    return this.#seriesShown;
  }
}
