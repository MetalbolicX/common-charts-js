import ScatterPlot from "./scatterplot-chart.mjs";

("use strict");

export default class BubbleChart extends ScatterPlot {
  #radiusSerie;
  #radiusFactor;
  constructor() {
    super();
    this.#radiusFactor = 0.5;
  }

  /**
   * @description
   * Getter and setter a callback to iterate in series that will be radius size.
   * @param {(d: object) => any} fn The callback function to deal with some series in the dataset.
   * @returns {(d: object) => any|this}
   * @example
   * ```JavaScript
   * const chart = new ScatterPlot()
   *  .data([
   *    { month: "February", department: "Sales", europe: 52, asia: 40, america: 65 },
   *    { month: "March", department: "Sales", europe: 56, asia: 35, america: 70 }
   *  ])
   *  .radiusSerie((d) => d.europe);
   * ```
   */
  radiusSerie(fn) {
    return arguments.length
      ? ((this.#radiusSerie = fn), this)
      : this.#radiusSerie;
  }

  /**
   * @description
   * Getter and setter for the factor to change the radius.
   * @param {number} value The factor to decrease the radius value. The value must be greater than zero and less than 1.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new BubbleChart()
   *  .radiusFactor(0.4);
   * ```
   */
  radiusFactor(value) {
    if (!arguments.length) {
      return this.#radiusFactor;
    }
    if (value > 0 && value <= 1) {
      this.#radiusFactor = +value;
    } else {
      console.error("Invalid value. It must be between 0 and 1");
    }
    return this;
  }

  /**
   * @description
   * Creates the data points in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new BubbleChart()
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
      .data(this.yConfiguration().numericalSeries)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    seriesGroup
      .selectAll(".serie")
      .selectAll("circle")
      .data((d) =>
      this.data().map((r) => ({
        serie: d,
        x: r[this.xConfiguration().serieName],
        y: r[d],
        category: r[this.categoryConfiguration().serie],
        radius: this.radiusSerie()(r)
      }))
      )
      .join("circle")
      .attr("class", (d) => `${d.serie.toLowerCase().replace(" ", "-")} point`)
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", (d) => d.radius * this.radiusFactor())
      .style("fill", (d) => this.colorScale(d.category));
  }
}
