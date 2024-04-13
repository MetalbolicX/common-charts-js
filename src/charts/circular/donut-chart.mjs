import PieChart from "./pie-chart.mjs";

("use strict");

const { pie, arc } = d3;

export default class DonutChart extends PieChart {
  #donutSpacing;

  constructor() {
    super();
    this.#donutSpacing = 0.2;
  }

  /**
   * @description
   * Add a space between the rings series of the donut chart.
   * @param {number} value The rational number to space the rings of the donut chart. The value must be between 0 and 1.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new DonutChart()
   *  .donutSpacing(0.3);
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
   * Add the slices to create the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new DonutChart()
   *  ...;
   *
   * chart.init();
   * chart.addSeries();
   * ```
   */
  addSeries() {
    const mainGroup = this._svg.select(".main");
    const groupSeries = mainGroup
      .selectAll(".serie")
      .data(this.yConfiguration().numericalSeries)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    // The pie data transformation function of D3 js to iterate the numerical values
    const pieData = pie().value((d) => d.y);
    /**
     * @description
     * The row of the dataset to create the slice of the pie chart.
     * @param {object} d The row in the dataset.
     * @param {string} serie The name of the serie to get the numeric values.
     * @param {number} index The index of the dataset row.
     * @returns {{x: string, y: number, radius: {inner: number, outer: number}}}
     */
    const getSerie = (d, serie, index) => ({
      x: this.xSerie()(d),
      y: d[serie],
      radius: {
        inner: this.donutSpacing() * (2 * index + 1) * this.circleRadius,
        outer: this.donutSpacing() * (2 * (index + 1)) * this.circleRadius,
      },
    });

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d, i) =>
        pieData(
          this.data()
            .map((r) => getSerie(r, d, i))
            .sort((a, b) => b.y - a.y)
        )
      )
      .join("g")
      .attr(
        "class",
        (d) => `${d.data.x.toLowerCase().replace(" ", "-")} arc`
      );

    groupSlices
      .append("path")
      .attr("d", (d) =>
        arc().innerRadius(d.data.radius.inner).outerRadius(d.data.radius.outer)(
          d
        )
      )
      .attr("class", (d) => `${d.data.x.toLowerCase().replace(" ", "-")} slice`)
      .style("fill", (d) => this.colorScale(d.data.x));
  }
}
