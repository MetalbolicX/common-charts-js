import PieChart from "./pie-chart.mjs";

("use strict");

const { pie, arc } = d3;

/**
 * @description
 * DonutChart represents a donut chart for categorical data.
 * @class
 * @extends PieChart
 */
export default class DonutChart extends PieChart {
  /**
   * @description
   * The value between one ring and the other ring of the donut chart. The value must be between 0 and 1.
   * @type {number}
   */
  #donutSpacing;

  /**
   * @description
   * Create a new instance of a Donuthart object.
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
   * const chart = new DonutChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
    this.#donutSpacing = 0.2;
  }

  /**
   * @description
   * Add a space between the rings series of the donut chart.
   * @param {number} value The rational number to space the rings of the donut chart. The value must be between 0 and 1.
   * @returns {number|DonutChart}
   * @example
   * ```JavaScript
   * const chart = new DonutChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * .donutSpacing(0.3);
   * ```
   */
  donutSpacing(value) {
    if (!arguments.length) {
      return this.#donutSpacing;
    }
    // Check the range of the percentage number
    if (value >= 0 && value <= 1) {
      this.#donutSpacing = +value;
    } else {
      console.error(
        "Invalid number. The only value allowed is between 0 and 1"
      );
    }
    return this;
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const mainGroup = this.svg.select(".main");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    const groupSeries = mainGroup
      .selectAll(".serie")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    // The pie data transformation function of D3 js to iterate the numerical values
    const pieData = pie().value((d) => d.y);
    /**
     * @description
     * The row of the dataset to create the slice of the pie chart.
     * @param {object} row The row in the dataset.
     * @param {string} serie The name of the serie to get the numeric values.
     * @param {number} index The index of the dataset row.
     * @returns {{x: string, y: number, radius: {inner: number, outer: number}}}
     */
    const getSerie = (row, serie, index) => ({
      x: row[this.xSerie()],
      y: row[serie],
      radius: {
        inner: this.donutSpacing() * (2 * index + 1) * this.circleRadius,
        outer: this.donutSpacing() * (2 * (index + 1)) * this.circleRadius,
      },
    });

    /**
     * Generates an SVG path segment for a circular arc.
     * @param {number} x - The x-coordinate of the center of the circle.
     * @param {number} y - The y-coordinate of the center of the circle.
     * @param {number} innerRadius - The inner radius of the arc.
     * @param {number} outerRadius - The outer radius of the arc.
     * @param {number} startAngle - The starting angle of the arc in degrees.
     * @param {number} endAngle - The ending angle of the arc in degrees.
     * @returns {string} SVG path segment representing the arc.
     */
    function generatePieSlice(
      x,
      y,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    ) {
      // convert angles to Radians
      startAngle *= Math.PI / 180;
      endAngle *= Math.PI / 180;

      // Make the 0° position at vertically rather than in normal position.
      startAngle -= Math.PI / 2;
      endAngle -= Math.PI / 2;

      const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1; // 1 if angle > 180 degrees
      const sweepFlag = 1; // is arc to be drawn in +ve direction?

      return [
        "M",
        x + Math.cos(startAngle) * innerRadius,
        y + Math.sin(startAngle) * innerRadius, // Move to inner start point
        "L",
        x + Math.cos(startAngle) * outerRadius,
        y + Math.sin(startAngle) * outerRadius, // Line to outer start point
        "A",
        outerRadius,
        outerRadius,
        0,
        largeArc,
        sweepFlag, // Outer arc
        x + Math.cos(endAngle) * outerRadius,
        y + Math.sin(endAngle) * outerRadius, // Outer end point
        "L",
        x + Math.cos(endAngle) * innerRadius,
        y + Math.sin(endAngle) * innerRadius, // Line to inner end point
        "A",
        innerRadius,
        innerRadius,
        0,
        largeArc,
        0, // Inner arc
        x + Math.cos(startAngle) * innerRadius,
        y + Math.sin(startAngle) * innerRadius, // Inner start point
        "Z", // Close path
      ].join(" ");
    }

    /**
     * Generates an interpolator function for transitioning between SVG path segments.
     * @param {number} x - The x-coordinate of the center of the circle.
     * @param {number} y - The y-coordinate of the center of the circle.
     * @param {number} innerRadius - The inner radius of the arc.
     * @param {number} outerRadius - The outer radius of the arc.
     * @param {number} startAngle - The starting angle of the arc in degrees.
     * @param {number} endAngle - The ending angle of the arc in degrees.
     * @returns {callback} An interpolator function that generates SVG path segments sized according to time.
     */
    const interpolateSlice =
      (x, y, innerRadius, outerRadius, startAngle, endAngle) =>
      /**
       * Interpolator function that generates SVG path segments.
       * @param {number} t - The time parameter ranging from 0 to 1.
       * @returns {string} SVG path segment representing the arc.
       */
      (t) =>
        generatePieSlice(
          x,
          y,
          innerRadius,
          outerRadius,
          startAngle,
          startAngle + (endAngle - startAngle) * t
        );

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d, i) =>
        pieData(
          this.dataset
            .map((row) => getSerie(row, d, i))
            .sort((a, b) => b.y - a.y)
        )
      )
      .join("g")
      .attr("class", (d) => `${d.data.x.toLowerCase().replace(" ", "-")} arc`);

    groupSlices
      .selectAll("path")
      .data((d) => [d])
      .join("path")
      .attr("class", (d) => `${d.data.x.toLowerCase().replace(" ", "-")} slice`)
      .transition(this.getTransition())
      .attrTween("d", (d) => {
        // Convert the angles from degrees to radians
        const startAngle = d.startAngle * (180 / Math.PI);
        const endAngle = d.endAngle * (180 / Math.PI);
        const x = 0;
        const y = 0;
        return interpolateSlice(
          x,
          y,
          d.data.radius.inner,
          d.data.radius.outer,
          startAngle,
          endAngle
        );
      })
      .style("fill", (d) => this.colorScale(d.data.x));
  }

  /**
   * @description
   * Add the slices to create the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new DonutChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addAllSeries();
   * ```
   */
  addAllSeries() {
    this.#addSeries("");
  }

  /**
   * @description
   * Create the just one serie in the chart by the given name.
   * @param {string} name The name of the serie to create.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new DonutChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addSerie("sales");
   * ```
   */
  addSerie(name) {
    this.#addSeries(name);
  }
}
