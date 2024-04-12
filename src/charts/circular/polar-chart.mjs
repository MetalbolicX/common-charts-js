import PieChart from "./pie-chart.mjs";

("use strict");

const { pie, arc } = d3;

export default class PolarChart extends PieChart {
  #sliceSize;
  #serieToShow;

  constructor() {
    super();
    this.#sliceSize = 2;
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
   * Getter and setter for the series to be rendered in the chart.
   * @param {string} serieName Name of the serie in the dateset to show the slices in the chart.
   * @returns {string|this}
   * @example
   * ```JavaScript
   * const chart = new PolarChart()
   *  .serieToShow("income");
   * ```
   */
  serieToShow(serieName) {
    return arguments.length && typeof serieName === "string"
      ? ((this.#serieToShow = serieName), this)
      : this.#serieToShow;
  }

  /**
   * @description
   * Add the slices to create the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PolarChart()
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

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d, i) =>
        // Process each serie of data to get the values for the arc path generator
        pie().value((t) => t.y)(
          this.data()
            .map((r) => ({
              x: this.xSerie()(r),
              y: this.serieToShow() === d ? r[d] : r[this.serieToShow()],
              textValue: r[d],
              serie: d,
              radius: {
                inner: 0,
                outer: this.sliceSize() * r[this.serieToShow()],
              },
            }))
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
      .attr(
        "class",
        (d) => `${d.data.x.toLowerCase().replace(" ", "-")} slice`
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
        return this.serieToShow() === d.data.serie
          ? `translate(${coordinates})`
          : `translate(${coordinates.at(0) * 2.5}, ${coordinates.at(1) * 2.5})`;
      })
      .attr(
        "class",
        (d) => `${d.data.x.toLowerCase().replace(" ", "-")} label`
      )
      .text((d) => `${d.data.x}: ${fnFormat(d.data.textValue)}`)
      .style("text-anchor", "middle");
  }
}
