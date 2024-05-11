("use strict");

const {
  select,
  transition,
  dispatch,
  greatestIndex,
  leastIndex,
  scaleLinear,
  scaleTime,
  scaleUtc,
  scalePow,
  scaleSqrt,
  scaleLog,
  scaleSymlog,
  scaleBand,
  scalePoint,
  scaleSequential,
  scaleDiverging,
  scaleQuantile,
  scaleQuantize,
  scaleThreshold,
  scaleOrdinal,
} = d3;

/**
 * @description
 * Chart is the base parent class with common properties to build any D3 js chart.
 * @class
 */
export default class Chart {
  /**
   * @description
   * D3 js selection of the svg element container to draw the chart.
   * @type {Selection}
   */
  #svg;
  /**
   * @description
   * The size of width the svg element container.
   * @type {number}
   */
  #width;
  /**
   * @description
   * The size of height the svg element container.
   * @type {number}
   */
  #height;
  /**
   * @description
   * The object that contains the margins necessary to set in the chart drawn in the svg container.
   * @see {@link https://observablehq.com/@d3/margin-convention}
   * @type {{top: number, right: number, bottom: number, left: number}}
   */
  #margin;
  /**
   * @description
   * The array of objects that contains the data necessary to draw the chart.
   * @type {object[]}
   */
  #dataset;
  /**
   * @description
   * The configuration for the y values of the chart. The object holds the color of the series and the D3 js scake to compute the numerical data.
   * @type {{colorSeries: string[], scale: D3Scale}}
   */
  #yConfiguration = { colorSeries: [], scale: undefined };
  /**
   * @description
   * The scale function to compute the numerical data to set the position in screen.
   * @type {D3Scale}
   */
  #y;
  /**
   * @description
   * The numerical vvalue in percentage to add an offset in the y scale extreme points of the domain.
   * @type {number}
   */
  #yAxisOffset;
  /**
   * @description
   * The D3 js ordinal scale to set the function that color any categorical set of values.
   * @type {D3Scale}
   */
  #colorScale;
  /**
   * @description
   * The array of the names of the numerical series to be used to draw the chart.
   * @type {string[]}
   */
  #ySeries = [];
  /**
   * @description
   * The array of the names of the numerical series to displat in the chart. This can you all the ySeries or just one at a time.
   * @type {string[]}
   */
  #seriesShown;
  /**
   * @description
   * The durantion of any transition in the chart measure in milliseconds.
   * @type {number}
   */
  #duration;
  /**
   * @description
   * The D3 js dispatcher to set the custom event listeners for the chart.
   * @type {D3Dispatcher}
   */
  #listeners;
  /**
   * @description
   * The array with the names of the fields of the dataset and the type of the data.
   * @type {string[]}
   */
  #fieldsTypes;
  /**
   * @description
   * The name of the fields in the dataset which are categorical type.
   * @type {string[]}
   */
  #categoricalSeries = [];
  /**
   * @description
   * The name of the fields in the dataset which are numerical type.
   * @type {string[]}
   */
  #numericalSeries = [];
  /**
   * @description
   * The object with the maximum and minimum values per each numerical serie in the dataset.
   * @type {{[key: string]: {serie: string, point: string, x: number, y: number}[]}}
   */
  #criticalPoints;

  /**
   * @description
   * Create a new instance of a Chart object.
   * @constructor
   * @param {object} config The object for the constructor parameters.
   * @param {string} config.bindTo The css selector for the svg container to draw the chart.
   * @param {object[]} config.dataset The dataset to create the chart.
   * @example
   * ```JavaScript
   * const dataset = [
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   * ];
   *
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    // Set the D3 js selection pf the svg element container
    this._svg = bindTo;
    this._dataset = dataset;
    // Set the metadata of the fields
    this._fieldsTypes = dataset.at(0);
    // Which are the categorical fields in the dataset
    this._categoricalSeries = this.#getFieldDataTypes("categorical");
    // Which are the numerical fields in the dataset
    this._numericalSeries = this.#getFieldDataTypes("numerical");
    // The minimum and maximum values per series
    this._criticalPoints = dataset;
    // Set the values of the svg element width and height
    this.#width = this.svg?.node().getBoundingClientRect().width || 800;
    this.#height = this.svg?.node().getBoundingClientRect().height || 600;
    this.#margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.#yAxisOffset = 0.05;
    this._colorScale = this._getD3Scale("ordinal");
    this.#seriesShown = undefined;
    this.#duration = 2000;
    this.#listeners = dispatch("mouseover", "mouseout");
  }

  /**
   * @description
   * Get the array of the fields from the given input.
   * @param {string} fieldType The type of the field to be got. The fieldType must be numerical or categorical.
   * @returns {string[]} The array of the fields names (categorical or numerical).
   */
  #getFieldDataTypes(fieldType) {
    return [...this.fieldsTypes]
      .filter(([field, type]) => type === fieldType && field.length)
      .map(([field, _]) => field);
  }

  /**
   * @description
   * Getter and setter for the height property.
   * @param {number} value The value of the height of the chart.
   * @returns {number|Chart}
   * @example
   * ```JavaScript
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .height(500);
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
   * @returns {number|Chart}
   * @example
   * ```JavaScript
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .width(500);
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
   * @returns {{top: number, right: number, bottom: number, left: number}|Chart}
   * @example
   * ```JavaScript
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .margin({
   *    top: 30,
   *    right: 50,
   *    bottom: 30,
   *    left: 50
   * });
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
   * Setter for the data to draw the chart.
   * @param {object[]} dataset The dataset to draw the chart as an array of objects.
   * @returns {void}
   * @access @protected
   */
  set _dataset(dataset) {
    if (Array.isArray(dataset) && dataset.every((d) => typeof d === "object")) {
      this.#dataset = [...dataset];
    } else {
      throw new Error("The only dataset allowed is an array of objects");
    }
  }

  /**
   * @description
   * Getter for the data to draw the chart.
   * @returns {object[]} The dataset to draw the chart as an array of objects.
   * @access @protected
   * @example
   */
  get dataset() {
    return this.#dataset;
  }

  /**
   * @description
   * Getter and setter of the configuration of the y numerical values to draw in the chart.
   * @param {object} config The configuration to give to the y (numerical) values series.
   * @param {string[]} config.colorSeries The string of the color to classify a each of the datasets.
   * @param {string} config.scale The name of the D3 js scale available by the library.
   * @returns {{colorSeries: string[], scale: string}|Chart}
   * @see {@link https://d3js.org/d3-scale}
   * @example
   * ```JavaScript
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .yConfiguration({
   *    colorSeries: ["black", "pink", "#aaa"]
   *    scale: "linear"
   * });
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
   * @returns {void}
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
   * @returns {number|Chart}
   * @example
   * ```JavaScript
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .yAxisOffset(0.05);
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
   * Set the svg element container for drawing the chart in the DOM.
   * @param {string} bindTo The css selector for the svg element to draw the chart.
   * @returns {void}
   * @access @protected
   */
  set _svg(bindTo) {
    const svgContainer = document.querySelector(bindTo);
    if (!svgContainer) {
      throw new Error("Cannot find SVG element container for the chart");
    }
    this.#svg = select(svgContainer);
  }

  /**
   * @description
   * Getter for the svg container of the chart.
   * @returns {Selection}
   * @access @protected
   */
  get svg() {
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
   * @returns {void}
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
   * @returns {void}
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
   * @param {string[]} fieldsToExclude The names of the column to exclude for the numerical fields.
   * @returns {string[]}
   * @access @protected
   */
  _getNumericalFieldsToUse(fieldsToExclude) {
    return this.numericalSeries.filter(
      (serie) => !fieldsToExclude.includes(serie)
    );
  }

  /**
   * @description
   * Setter for the series display in the chart.
   * @param {string[]} series The series to show in the chart.
   * @returns {void}
   * @access @protected
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

  /**
   * @description
   * Getter ans setter of the duration of the animations.
   * @param {number} milliseconds The duration of the animation to be executed.
   * @returns {number|Chart}
   * @example
   * ```JavaScript
   * const chart = new Chart()
   *  .duration(5000);
   * ```
   */
  duration(milliseconds) {
    return arguments.length && milliseconds >= 0
      ? ((this.#duration = +milliseconds), this)
      : this.#duration;
  }

  /**
   * @description
   * Gettet of the transition object to set the duration of the animations.
   * @returns {object}
   */
  getTransition() {
    return transition().duration(this.duration());
  }

  /**
   * @description
   * Attaches event listeners to the chart.
   * @param {...*} args - Arguments to be passed to the event listener.
   * @returns {callback|Chart} Returns the Chart instance if no additional function is returned, otherwise returns the function returned by the event listener.
   */
  on() {
    /**
     * @description
     * The function returned by the event listener.
     * @typedef {callback} ListenerFunction
     */

    /**
     * @description
     * Calls the "on" method of the listeners object with the provided arguments.
     * @type {ListenerFunction|Chart}
     */
    const fn = this.listeners.on.apply(this.listeners, arguments);
    // If the returned function is the same as the listeners object, return the Chart instance,
    // otherwise return the returned function
    return fn === this.listeners ? this : fn;
  }

  /**
   * @description
   * Getter function to access the listeners object.
   * @returns {object} The listeners object.
   */
  get listeners() {
    return this.#listeners;
  }

  /**
   * @description
   * Setter function to set the types of fields in the dataset.
   * If the provided sample is an object, it determines whether each field is numerical or categorical.
   * @param {object} row - The row object representing the dataset.
   * @returns {void}
   * @access @protected
   */
  set _fieldsTypes(row) {
    if (typeof row === "object") {
      /**
       * @description
       * Map storing the types of fields in the dataset.
       * Keys represent field names, values represent field types (either "numerical" or "categorical").
       * @type {Map<string, string>}
       */
      this.#fieldsTypes = new Map(
        Object.entries(row).map(([field, value]) => [
          field,
          typeof value === "number" ? "numerical" : "categorical",
        ])
      );
    } else {
      console.error("Invalid dataset, it must be an array of objects");
    }
  }

  /**
   * @description
   * Getter function to access the types of fields in the dataset.
   * @returns {Map<string, string>} The map containing field names and their corresponding types.
   */
  get fieldsTypes() {
    return this.#fieldsTypes;
  }

  /**
   * @description
   * Setter function to define the names of categorical series.
   * @param {string[]} series An array of strings representing the names of categorical series.
   * @returns {void}
   * @access @protected
   */
  set _categoricalSeries(series) {
    if (series.length && series.every((serie) => typeof serie === "string")) {
      this.#categoricalSeries = [...series];
    } else {
      console.error("The field names must be string type");
    }
  }

  /**
   * @description
   * Getter function to access the names of categorical series.
   * @returns {string[]} An array containing the names of categorical series.
   */
  get categoricalSeries() {
    return this.#categoricalSeries;
  }

  /**
   * @description
   * Setter function to define the names of numerical series.
   * @param {string[]} series An array of strings representing the names of numerical series.
   * @returns {void}
   * @access @protected
   */
  set _numericalSeries(series) {
    if (series.length && series.every((serie) => typeof serie === "string")) {
      this.#numericalSeries = [...series];
    } else {
      console.error("The field names must be string type");
    }
  }

  /**
   * @description
   * Getter function to access the names of numerical series.
   * @returns {string[]} An array containing the names of numerical series.
   */
  get numericalSeries() {
    return this.#numericalSeries;
  }

  /**
   * @description
   * Setter of the critical points (maximum and minimum) of each serie in an object.
   * @param {object[]} dataset The dataset to get the critical points of the numerical series
   * @returns {{[key: string]: {serie: string, point: string, x: number, y: number}[]}}
   * @access @protected
   */
  set _criticalPoints(dataset) {
    this.#criticalPoints = this.numericalSeries.reduce((group, serie) => {
      const currentSerie = dataset.map((d) => d[serie]);
      return {
        ...group,
        [serie]: [
          {
            serie,
            point: "max",
            x: greatestIndex(currentSerie),
            y: Math.max(...currentSerie),
          },
          {
            serie,
            point: "min",
            x: leastIndex(currentSerie),
            y: Math.min(...currentSerie),
          },
        ],
      };
    }, {});
  }


  /**
   * @description
   * Get any of the D3 js scales of the library. See details.
   * @param {string} scale The name of the D3 js scale generator available by the library.
   * @returns {D3Scale}
   * @see {@link https://d3js.org/d3-scale}
   * @access @protected
   */
  _getD3Scale(scale) {
    /** @enum {D3Scale} */
    const D3Scales = {
      linear: scaleLinear(),
      time: scaleTime(),
      utc: scaleUtc(),
      pow: scalePow(),
      sqrt: scaleSqrt(),
      log: scaleLog(),
      symlog: scaleSymlog(),
      band: scaleBand(),
      point: scalePoint(),
      sequential: scaleSequential(),
      diverging: scaleDiverging(),
      quantile: scaleQuantile(),
      quantize: scaleQuantize(),
      threshold: scaleThreshold(),
      ordinal: scaleOrdinal(),
    }
    return D3Scales[scale] || D3Scales.linear;
  }

  /**
   * @description
   * Getter of the critical points (max and min) of each serie.
   * @returns {{[key: string]: {serie: string, point: string, x: number, y: number}[]}}
   */
  get criticalPoints() {
    return this.#criticalPoints;
  }

  /**
   * @description
   * Add the div elements to the DOM, so that it can be used to display the tooltip.
   * @param {object} tooltipStyles The object literal with the CSS styles to apply to the tooltip.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new Chart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addTooltip({
   *      opacity: "0",
   *      background: "#eeeeee",
   *      pointerEvents: "none",
   *      borderRadius: "2px",
   *      padding: "5px",
   *      position: "absolute",
   *      top: "0",
   *      left: "0",
   *      zIndex: "1",
   * });
   * ```
   */
  addTooltip(
    tooltipStyles = {
      opacity: "0",
      background: "#eeeeee",
      pointerEvents: "none",
      borderRadius: "2px",
      padding: "5px",
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "1",
    }
  ) {
    let tooltip = document.querySelector("#tooltip");
    // In case the tooltip element exists
    if (tooltip) {
      return;
    }
    // If the tooltip element does not exist then create it
    tooltip = document.createElement("div");
    tooltip.setAttribute("id", "tooltip");
    // Apply the styles for the tooltip
    for (const cssStyle in tooltipStyles) {
      tooltip.style[cssStyle] = tooltipStyles[cssStyle];
    }
    document.body.append(tooltip);
  }
}
