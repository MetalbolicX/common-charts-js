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
      .on("mouseover", (e) => this.listeners.call("mouseover", this, e))
      .on("mouseout", (e) => this.listeners.call("mouseout", this, e))
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    groupSeries
      .selectAll("g")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => d.toLowerCase().replace(" ", "-"));

    const areaGenerator = area()
      .y0(this.y.range().at(0))
      .x((d) => this.x(d.x))
      .y1((d) => this.y(d.y));

    /**
     * @description
     * The rearranged data to drawn the line chart with the svg path element.
     * @param {string} serie The serie datum name.
     * @returns {[{serie: string, values: {x: number, y: number}[]}]}
     */
    const rearrangedData = (serie) => [
      {
        serie,
        values: this.data().map((row) => ({
          x: row[this.xConfiguration().serie],
          y: row[serie],
        })),
      },
    ];

    const drawSerie = (selection) =>
      selection
        .delay((d, i) => i * (this.duration() / d.values.length))
        .attrTween("d", function (d) {
          /** @type {string}*/
          const areaPath = areaGenerator(d.values);
          /** @type {number}*/
          const length = this.getTotalLength();
          return (/** @type {number}*/ time) =>
            areaPath.substring(0, length * time); //
        })
        .style("fill", (d) => this.colorScale(d));

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => rearrangedData(d))
      .join(
        (enter) =>
          enter
            .append("path")
            .style("fill", "none")
            .attr("d", (d) => areaGenerator(d.values))
            .transition(this.getTransition())
            .call(drawSerie),
        (update) =>
          update
            .style("fill", "none")
            .transition(this.getTransition())
            .call(drawSerie),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.serie} serie`);
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
   * chart.addSerie("sales");
   * ```
   */
  addSerie(name) {
    this.#addSeries(name);
  }
}
