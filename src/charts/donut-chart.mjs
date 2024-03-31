import CircleChart from "./circle-chart.mjs";

("use strict");

const { pie, arc, format } = d3;

export default class DonutChart extends CircleChart {
  #donutSpacing;

  constructor() {
    super();
    this.#donutSpacing = 0.2;
  }

  donutSpacing(value) {
    return arguments.length
      ? ((this.#donutSpacing = +value), this)
      : this.#donutSpacing;
  }

  addSeries(fnFormat = format(".1f")) {
    const mainGroup = this._svg.select(".main");
    const groupSeries = mainGroup
      .selectAll(".serie")
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d, i) =>
        // Process each serie of data to get the values for the arc path generator
        pie().value((t) => t.datum)(
          this.yValues.map((r, j) => ({
            category: this.xValues.at(j),
            datum: r[d],
            radius: {
              inner: this.donutSpacing() * (2 * i + 1) * this.mainRadius,
              outer: this.donutSpacing() * (2 * (i + 1)) * this.mainRadius,
            },
          })).sort((a, b) => b.datum - a.datum)
        )
      )
      .join("g")
      .attr(
        "class",
        (d) => `${d.data.category.toLowerCase().replace(" ", "-")} arc`
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
        (d) => `${d.data.category.toLowerCase().replace(" ", "-")} slice`
      )
      .style("fill", (d) => this.colorScale()(d.data.category));
  }
}
