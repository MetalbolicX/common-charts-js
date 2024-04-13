import MultiLineChart from "./multiline-chart.mjs";

const { area } = d3;

("use strict");

export default class MultiAreaChart extends MultiLineChart {
  constructor() {
    super();
  }
  /**
   * @description
   * Create the multiline series graph.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiAreaChart()
   *  ...;
   *
   * chart.init();
   * char.addSeries();
   * ```
   */
  addSeries() {
    const groupSeries = this._svg.append("g").attr("class", "series");

    groupSeries
      .selectAll("g")
      .data(this.yConfiguration().numericalSeries)
      .join("g")
      .attr("class", (d) => d.toLowerCase().replace(" ", "-"));

    const pathGenerator = area()
      .y0(this.y.range().at(0))
      .x((d) => this.x(d.x))
      .y1((d) => this.y(d.y));

    /**
     * @description
     * The rearranged data to drawn the line chart with the svg path element.
     * @param {string} serie The serie datum name.
     * @param {string} xSerieName The name of the x serie in the dataset.
     * @returns {[{serie: string, values: {x: number, y: number}[]}]}
     */
    const rearrangedData = (serie, xSerieName) => [
      {
        serie,
        values: this.data().map((r) => ({
          x: r[xSerieName],
          y: r[serie],
        })),
      },
    ];

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => rearrangedData(d, this.xConfiguration().serie))
      .join("path")
      .attr("class", (d) => `${d.serie} serie`)
      .attr("d", (d) => pathGenerator(d.values))
      .style("fill", (d) => this.colorScale(d.serie))
      .style("stroke", (d) => this.colorScale(d.serie));
  }
}
