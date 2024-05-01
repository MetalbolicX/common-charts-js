import MultiLineChart from "./multiline-chart.mjs";

("use strict");

const { area } = d3;

export default class MultiAreaChart extends MultiLineChart {
    /**
   * @description
   * Create a new instance of a MultiAreaChart object.
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
   * const chart = new MultiAreaChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset}) {
    super({ bindTo, dataset });
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const groupSeries = this.svg
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
        values: this.dataset.map((row) => ({
          x: row[this.xConfiguration().serie],
          y: row[serie],
        })),
      },
    ];

    const initializeAreas = (areas) =>
      areas.attr("d", (d) => areaGenerator(d.values)).style("opacity", 0);

    const drawSeriesPaths = (paths) =>
      paths
        .transition(this.getTransition())
        .delay((d, i) => i * (this.duration() / d.values.length))
        .style("opacity", 0.5);

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => rearrangedData(d))
      .join(
        (enter) =>
          enter
            .append("path")
            .call(initializeAreas)
            .call(drawSeriesPaths),
        (update) =>
          update
            .call(initializeAreas)
            .call(drawSeriesPaths),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.serie} serie`)
      .style("fill", (d) => this.colorScale(d.serie));
  }

  /**
   * @description
   * Create the multiline series graph.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiAreaChart({
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
   * const chart = new MultiAreaChart({
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
