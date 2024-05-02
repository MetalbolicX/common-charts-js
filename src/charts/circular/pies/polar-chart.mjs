import PieChart from "./pie-chart.mjs";

("use strict");

const { pie, arc } = d3;

export default class PolarChart extends PieChart {
  #sliceSize;
  #serieToShow;

  constructor() {
    super();
    this.#sliceSize = 2;
    this.#serieToShow = undefined;
  }

  /**
   * @description
   * Getter and setter for the value multiplier for the slice size.
   * @param {number} value The rational number to space the rings of the donut chart. The value must be between 0 and 1.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new PolarChart()
   *  .sliceSize(8);
   * ```
   */
  sliceSize(value) {
    return arguments.length && value >= 2
      ? ((this.#sliceSize = +value), this)
      : this.#sliceSize;
  }

  /**
   * @description
   * Add the slices to create the chart and select which serie will be shown.
   * @param {string} name The name of the serie to show.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PolarChart()
   *  ...;
   *
   * chart.init();
   * chart.addSeries("sales");
   * ```
   */
  addSeries(name) {
    const mainGroup = this._svg.select(".main");
    this.#serieToShow = name;
    const groupSeries = mainGroup
      .selectAll(".serie")
      .data(this.ySeries)
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
     * @returns {{x: string, y: number, textValue: string, serie: string, radius: {inner: number, outer: number}}}
     */
    const getSerie = (row, serie) => ({
      x: row[this.xSerie()],
      y: serie === name ? row[serie] : row[this.#serieToShow],
      textValue: row[serie],
      serie,
      radius: {
        inner: 0,
        outer: this.sliceSize() * row[this.#serieToShow],
      },
    });

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d) =>
        pieData(
          this.data()
            .map((row) => getSerie(row, d))
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
      .attr("d", (d) =>
        arc().innerRadius(d.data.radius.inner).outerRadius(d.data.radius.outer)(
          d
        )
      )
      .style("fill", (d) => this.colorScale(d.data.x));
  }

  /**
   * @description
   * Add labels of data of each slice.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js function to format the value in each slice. By default the function is d3.format(".1f").
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PolarChart()
   *  ...;
   *
   * chart.init();
   * chart.addLabels(d3.format("$.1f"));
   * ```
   */
  addLabels(fnFormat = format(".1f")) {
    const groupSlices = this._svg.selectAll(".arc");
    groupSlices
      .append("text")
      .attr("transform", (d) => {
        const coordinates = arc()
          .innerRadius(d.data.radius.inner)
          .outerRadius(d.data.radius.outer)
          .centroid(d);
        return this.#serieToShow === d.data.serie
          ? `translate(${coordinates})`
          : `translate(${coordinates.at(0) * 2.5}, ${coordinates.at(1) * 2.5})`;
      })
      .attr("class", (d) => `${d.data.x.toLowerCase().replace(" ", "-")} label`)
      .text((d) => `${d.data.x}: ${fnFormat(d.data.textValue)}`)
      .style("text-anchor", "middle");
  }
}
