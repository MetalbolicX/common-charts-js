import Chart from "./chart.mjs";

("use strict");

export default class CircleChart extends Chart {
  #xSerie;
  #circleRadius;

  constructor() {
    super();
    this.#circleRadius = undefined;
  }

  /**
   * @description
   * Getter and setter a callback to iterate the x serie in the dataset.
   * @param {(d: object) => any} fn The callback function to deal with the x serie.
   * @returns {(d: object) => any|this}
   * @example
   * ```JavaScript
   * const chart = new RectangularChart()
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
   * Getter and setter for the maximum si<e radius in the chart.
   * @param {number} radius The size of the maximum radius of the chart.
   * @returns {number|this}
   * @access @protected
   */
  _circleRadius(radius) {
    return arguments.length && radius > 0
      ? ((this.#circleRadius = +radius), this)
      : this.#circleRadius;
  }
}
