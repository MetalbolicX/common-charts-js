import MultiLineChart from "./multiline-chart.mjs";

("use strict");

const { area } = d3;

export default class MultiAreaChart extends MultiLineChart {

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
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => d);

    const pathGenerator = area()
      .y0(this.y.range().at(0))
      .x((d) => this.x(d.category))
      .y1((d) => this.y(d.value));

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => [
        {
          serie: d,
          values: this.yValues.map((r, i) => ({
            category: this.xValues.at(i),
            value: r[d],
          })),
        },
      ])
      .join("path")
      .attr("class", (d) => `${d.serie} serie`)
      .attr("d", (d) => pathGenerator(d.values))
      .style("fill", (d) => this.colorScale()(d.serie))
      .style("stroke", (d) => this.colorScale()(d.serie));
  }
}
