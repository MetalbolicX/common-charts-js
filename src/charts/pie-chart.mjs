import CircleChart from "./circle-chart.mjs";

("use strict");

const { pie, arc, format } = d3;

export default class PieChart extends CircleChart {
  constructor() {
    super();
  }

    /**
   * @description
   * Add the slices to create the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PieChart()
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
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d) =>
        // Process each serie of data to get the values for the arc path generator
        pie().value((t) => t.datum)(
          this.yValues
            .map((r, i) => ({
              category: this.xValues.at(i),
              datum: r[d],
              radius: {
                inner: 0,
                outer: this.mainRadius,
              },
            }))
            .sort((a, b) => b.datum - a.datum)
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

  /**
   * @description
   * Add labels of data of each slice.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js function to format the value in each slice. By default the function is d3.format(".1f").
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PieChart()
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
      .attr(
        "transform",
        (d) =>
          `translate(${arc()
            .innerRadius(d.data.radius.inner)
            .outerRadius(d.data.radius.outer)
            .centroid(d)})`
      )
      .attr(
        "class",
        (d) => `${d.data.category.toLowerCase().replace(" ", "-")} label`
      )
      .text((d) => `${d.data.category}: ${fnFormat(d.value)}`)
      .style("text-anchor", "middle");
  }

    /**
   * @description
   * Render the legend of the series to explain the color  of each element.
   * @param {object} [config={widthOffset: 0.8, heightOffset: 0.1, size: 5, spacing: 5}] The object configuration to set the square of the legend, spacing and position.
   * @param {number} config.widthOffset The offset in percentage to position the legend group in horizontal position. Zero means closest to left of the screen. The value must be between 0 and 1.
   * @param {number} config.heightOffset The offset in percentage to position the legend group in vertical position. Zero means closest to top of the screen. The value must be between 0 and 1.
   * @param {number} config.size The size of the square in pixels.
   * @param {number} config.spacing The spacing in pixels between the square and the name of the serie.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PieChart()
   *  ...;
   *
   * chart.init();
   * chart.addLegend({
   *    widthOffset: 0.75,
   *    heightOffset: 0.15,
   *    size: 4,
   *    spacing: 5
   * });
   * ```
   */
    addLegend(
      config = { widthOffset: 0.85, heightOffset: 0.05, size: 5, spacing: 5 }
    ) {
      const legendGroup = this._svg
        .select(".main")
        .append("g")
        .attr("class", "legends")
        .attr(
          "transform",
          `translate(${config.widthOffset * this.mainRadius}, ${
            config.heightOffset * this.mainRadius
          })`
        );

      legendGroup
        .selectAll("rect")
        .data(this.xValues)
        .join("rect")
        .attr("class", (d) => `${d} legend`)
        .attr("width", config.size)
        .attr("height", config.size)
        .attr("y", (_, i) => (config.size + config.spacing) * i)
        .style("fill", (d) => this.colorScale()(d));

      legendGroup
        .selectAll("text")
        .data(this.xValues)
        .join("text")
        .attr("class", (d) => `${d} legend-name`)
        .attr("x", config.size + config.spacing)
        .attr("y", (_, i) => (config.size + config.spacing) * i)
        .attr("dy", config.size)
        .text((d) => d)
        .style("fill", (d) => this.colorScale()(d));
    }

    /**
     * @description
     * Add the title to the chart and configure the position of it.
     * @param {object} config The configuration object to add the title and position of the title in the chart.
     * @param {string} config.title The title of the chart.
     * @param {number} config.widthOffset The horizontal positioning in percentage of the title. Zero means closest to left of the screen. One means the farthest from the left of the screen. The number must be between 0 and 1.
     * @param {number} config.heightOffset The vertical positioning in percentage of the title. Zero means closest to top of the screen. One means the farthest from the top of the screen. The number must be between 0 and 1.
     * @example
     * ```JavaScript
     * // Set all the parameters of the chart
     * const chart = new PieChart()
     *  ...;
     *
     * chart.init();
     * chart.addTitle({
     *    title: "Christmas sales perdiod",
     *     widthOffset: 0.5, // The title will be horizontally at the middle
     *    heightOffset: 0
     * });
     * ```
     */
    addTitle(config) {
      const titleGroup = this._svg.append("g").attr("class", "chart-title");
      titleGroup
        .append("text")
        .attr("x", this.width() * config.widthOffset)
        .attr("y", this.height() * config.heightOffset)
        .text(config.title)
        .style("text-anchor", "middle");
    }
}
