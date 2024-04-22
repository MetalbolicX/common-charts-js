import MultiLineChart from "./multiline-chart.mjs";

const { area } = d3;

("use strict");

export default class MultiAreaChart extends MultiLineChart {
  constructor() {
    super();
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const groupSeries = this._svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    groupSeries
      .selectAll("g")
      .data(this.seriesShown)
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
        values: this.data().map((row) => ({
          x: row[xSerieName],
          y: row[serie],
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
   * const chart = new MultiAreaChart()
   *  ...;
   *
   * chart.init();
   * chart.addSerie();
   * ```
   */
  addSerie(name) {
    this.#addSeries(name);
  }
}
