import CircleChart from "../circle-chart.mjs";

("use strict");

const { pie, arc, format } = d3;

/**
 * @description
 * PieChart represents a single pie chart.
 * @class
 * @extends CircleChart
 */
export default class PieChart extends CircleChart {
  /**
   * @description
   * Create a new instance of a PieChart object.
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
   * const chart = new PieChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    // What is the least size (width or height) that limits the space of the chart
    const widthCircle =
      this.width() - (this.margin().right + this.margin().left);
    const heightCircle =
      this.height() - (this.margin().top + this.margin().bottom);
    this._circleRadius = Math.min(widthCircle, heightCircle) / 2;
    // Set the numerical serie
    this._ySeries = this._getNumericalFieldsToUse([""]);
    // Set the color schema
    this.colorScale
      .domain(this.dataset.map((d) => d[this.xSerie()]))
      .range(this.yConfiguration().colorSeries);
    // Set the g element for centered
    this.svg
      .append("g")
      .attr("class", "main")
      .attr(
        "transform",
        `translate(${widthCircle / 2 + this.margin().left}, ${
          heightCircle / 2 + this.margin().top
        })`
      );
  }

  /**
   * @description
   * Add the slices to create the chart.
   * @param {string} name The name of the serie to add to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new PieChart({
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
    const mainGroup = this.svg.select(".main");

    this._seriesShown = this.ySeries.filter((serie) => serie === name);

    const groupSeries = mainGroup
      .selectAll(".serie")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    // The pie data transformation function of D3 js to iterate the numerical values
    const pieData = pie().value((d) => d.y);
    /**
     * @description
     * The row of the dataset to create the slice of the pie chart.
     * @param {object} row The row in the dataset.
     * @param {string} serie The name of the serie to get the numeric values
     * @returns {{x: string, y: number, radius: {inner: number, outer: number}}}
     */
    const getSerie = (row, serie) => ({
      x: row[this.xSerie()],
      y: row[serie],
      radius: { inner: 0, outer: this.circleRadius },
    });

    const groupSlices = groupSeries
      .selectAll(".arc")
      .data((d) =>
        pieData(
          this.dataset
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
   * const chart = new PieChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addLabels(d3.format("$.1f"));
   * ```
   */
  addLabels(fnFormat = format(".1f")) {
    const groupSlices = this.svg.selectAll(".arc");

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
      .attr("class", (d) => `${d.data.x.toLowerCase().replace(" ", "-")} label`)
      .text((d) => `${d.data.x}: ${fnFormat(d.data.y)}`)
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
   * const chart = new PieChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
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
    const legendGroup = this.svg
      .select(".main")
      .append("g")
      .attr("class", "legends")
      .attr(
        "transform",
        `translate(${config.widthOffset * this.circleRadius}, ${
          config.heightOffset * this.circleRadius
        })`
      );

    legendGroup
      .selectAll("rect")
      .data(this.colorScale.domain())
      .join("rect")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale(d));

    legendGroup
      .selectAll("text")
      .data(this.colorScale.domain())
      .join("text")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend-name`)
      .attr("x", config.size + config.spacing)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .attr("dy", config.size)
      .text((d) => d)
      .style("fill", (d) => this.colorScale(d));
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
   * const chart = new PieChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
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
    const titleGroup = this.svg.append("g").attr("class", "chart-title");
    titleGroup
      .append("text")
      .attr("x", this.width() * config.widthOffset)
      .attr("y", this.height() * config.heightOffset)
      .text(config.title)
      .style("text-anchor", "middle");
  }
}
