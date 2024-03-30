import CircleChart from "./circle-chart.mjs";

("use strict");

const { pie, arc, format } = d3;

export default class PieChart extends CircleChart {

  addSeries(fnFormat = format(".1f")) {
    const mainGroup = this._svg.select(".main");
    const groupSeries = mainGroup
      .selectAll(".serie")
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);
    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d) =>
        // Process each serie of data to get the values for the arc path generator
        pie().value((t) => t.datum)(
          this.yValues.map((r, i) => ({
            category: this.xValues.at(i),
            datum: r[d],
          }))
        )
      )
      .join("g")
      .attr(
        "class",
        (d) => `${d.data.category.toLowerCase().replace(" ", "-")} arc`
      );

    const arcGenerator = arc().innerRadius(0).outerRadius(this.mainRadius);
    groupSlices
      .append("path")
      .attr("d", arcGenerator)
      .attr(
        "class",
        (d) => `${d.data.category.toLowerCase().replace(" ", "-")} slice`
      )
      .style("fill", (d) => this.colorScale()(d.data.category));

    groupSlices
      .append("text")
      .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
      .attr(
        "class",
        (d) => `${d.data.category.toLowerCase().replace(" ", "-")} label`
      )
      .text((d) => `${d.data.category}: ${fnFormat(d.value)}`)
      .style("text-anchor", "middle");
  }
}
