import Chart from "../chart.mjs";

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
   * Getter and setter of the name serie in the dataset that will be x serie.
   * @param {string} name The name of the serie in the dataset of the x serie.
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new CircleChart()
   *  .data([
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .xSerie("date");
   * ```
   */
  xSerie(name) {
    return arguments.length && typeof name === "string" ? ((this.#xSerie = name), this) : this.#xSerie;
  }

  /**
   * @description
   * Setter for the maximum si<e radius in the chart.
   * @param {number} radius The size of the maximum radius of the chart.
   * @access @protected
   */
  set _circleRadius(radius) {
    if (radius > 0) {
      this.#circleRadius = +radius;
    } else {
      console.error("The radius value must be greater than zero");
    }
  }

  /**
   * @description
   * Getter of the maximum si<e radius in the chart.
   * @returns {number}
   */
  get circleRadius() {
    return this.#circleRadius;
  }
}
