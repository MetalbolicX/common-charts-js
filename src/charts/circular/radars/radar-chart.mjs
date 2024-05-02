import CircleChart from "../circle-chart.mjs";

("use strict");

const { select, lineRadial, curveLinearClosed, format } = d3;

/**
 * @description
 * RadarChart represents a radial chart in polar coordinates.
 * @class
 * @extends CircleChart
 */
export default class RadarChart extends CircleChart {
  /**
   * @description
   * The quantity of circles to show as the x axis.
   * @type {number}
   */
  #axisTicks;

  /**
   * @description
   * Create a new instance of a RadarChart object.
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
   * const chart = new RadarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
    this.#axisTicks = 3;
  }

  /**
   * @description
   * Getter and setter for the quantity of ticks to draw in the chart.
   * @param {number} value The quantity of ticks for the circles to make the radar chart.
   * @returns {number|this}
   */
  axisTicks(value) {
    return arguments.length && value > 0
      ? ((this.#axisTicks = +value), this)
      : this.#axisTicks;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    const widthCircle = this.width() - this.margin().left - this.margin().right;
    const heightCircle =
      this.height() - this.margin().top - this.margin().bottom;
    this._circleRadius = Math.min(widthCircle, heightCircle) / 2;
    // Set the numerical series to use the chart
    this._ySeries = this._getNumericalFieldsToUse([""]);
    // Set the color schema
    this.colorScale
      .domain(this.ySeries)
      .range(this.yConfiguration().colorSeries);
    // Find the highest value of all series
    const ySerieRange = this._serieRange(
      this.dataset.flatMap((row) => this.ySeries.map((serie) => row[serie]))
    );
    // Set the scale of the radius
    this._y = this.yConfiguration()
      .scale.domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([0, this.circleRadius]);
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
   * Add circles of axis for the radar chart.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js format function to format the data displayed in the label. By default the function is d3.format(".1f"). See the link for more details.
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * // Set a custom format for the postfix in a number
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * chart.init();
   * chart.addRadialAxis(customUnits.format("$.1f"));
   * ```
   */
  addRadialAxis(fnFormat = format(".1f")) {
    const ticks = Array.from({ length: this.axisTicks() }).map(
      (_, i) => (this.y.domain().at(-1) * i) / this.axisTicks()
    );

    const groupAxes = this.svg
      .select(".main")
      .append("g")
      .attr("class", "radial axes");

    const circlesGroup = groupAxes
      .selectAll(".axes.ticks")
      .data(ticks)
      .join("g")
      .attr("class", "axes ticks");
    // Draw the circles for the axis
    circlesGroup
      .append("circle")
      .attr("class", "x axis tick")
      .attr("r", (d) => this.y(d));
    // Add the meaning of the size per each axis circle
    circlesGroup
      .append("text")
      .attr("class", "x axis size")
      .attr("dy", (d) => this.y(d))
      .text((d) => fnFormat(d))
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Add lines per each category in the axis around the circle.
   * @return {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addAxisLines();
   * ```
   */
  addAxisLines() {
    const groupAxes = this.svg
      .select(".main")
      .append("g")
      .attr("class", "lines axes");

    /** @type {{x: string, radians: number}[]}*/
    const anglesPerCategory = this.dataset.map((row, i, ns) => ({
      x: row[this.xSerie()],
      radians: ((2 * Math.PI) / ns.length) * i,
    }));

    groupAxes
      .selectAll("line")
      .data(anglesPerCategory)
      .join("line")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} axis`)
      .attr("x2", (d) => this.circleRadius * Math.sin(d.radians))
      .attr("y2", (d) => this.circleRadius * Math.cos(d.radians));

    groupAxes
      .selectAll("text")
      .data(anglesPerCategory)
      .join("text")
      .attr("class", (d) => `${d.x.toLowerCase().replace(" ", "-")} label`)
      .attr("x", (d) => this.circleRadius * Math.sin(d.radians))
      .attr("y", (d) => -this.circleRadius * Math.cos(d.radians))
      .text((d) => d.x)
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const seriesGroup = this.svg
      .select(".main")
      .selectAll(".series")
      .data([null])
      .join("g")
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    const pathsGroup = seriesGroup
      .selectAll("g")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")}`);

    // Set the D3 js line radial generator for a serie os data to create the string svg path
    const pathGenerator = lineRadial()
      .radius((d) => this.y(d.y))
      .angle((d) => d.radian)
      .curve(curveLinearClosed);

    /**
     * @description
     * The rearranged data to drawn the line chart with the svg path element.
     * @param {string} serie The name of the serie to get the numerical values.
     * @returns {{serie: string, values: {y: number, radian: number}[]}[]}
     */
    const getSerie = (serie) => [
      {
        serie,
        values: this.dataset.map((row, i, ns) => ({
          y: row[serie],
          radian: ((2 * Math.PI) / ns.length) * i,
        })),
      },
    ];

    pathsGroup
      .selectAll("path")
      .data((d) => getSerie(d))
      .join("path")
      .attr("class", (d) => `${d.serie.toLowerCase().replace(" ", "-")} serie`)
      .attr("d", (d) => pathGenerator(d.values))
      .style("stroke", (d) => this.colorScale(d.serie))
      .style("fill", (d) => this.colorScale(d.serie));
  }

  /**
   * @description
   * Add the series of the radial chart.
   * @return {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart({
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
   * const chart = new RadarChart({
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

  /**
   * @description
   * Add the text labels of data of each serie.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js format function to format the data displayed in the label. By default the function is d3.format(".1f"). See the link for more details.
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new RadarChart({
   *    bindTo: "svg.chart",
   *    dataset
   * })
   * ...;
   * // Set a custom format for the postfix in a number
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * chart.init();
   * chart.addLabels(customUnits.format("$.1f"));
   * ```
   */
  addLabels(fnFormat = format(".1f")) {
    const pathsSeries = this.svg.selectAll(".series > g path");

    pathsSeries.each((d, i, ns) => {
      const currentPath = select(ns[i]);
      /** @type {{category: string, value: number}[]} */
      const serie = this.dataset.map((row) => ({
        value: row[d],
        category: row[this.xSerie()],
      }));
      const coordinates = this.#extractCoordinates(
        currentPath.attr("d"),
        serie
      );

      const parent = select(ns[i].parentElement);
      parent
        .selectAll("text")
        .data(coordinates)
        .join("text")
        .attr(
          "class",
          (r) =>
            `${d.toLowerCase().replace(" ", "-")} ${r.category
              .toLowerCase()
              .replace(" ", "-")} label`
        )
        .attr("x", (r) => r.xPosition)
        .attr("y", (r) => r.yPosition)
        .text((r) => fnFormat(r.y));
    });
  }

  /**
   * @description
   * From a svg path which was created using line radial, extract the x and y coordinates.
   * @param {string} svgPath The string of the SVG path element.
   * @param {{category: string, value: number}[]} serieValues The values of data points.
   * @returns {{xPosition: number, yPosition: number, y: number, category: string}[]}
   */
  #extractCoordinates(svgPath, serieValues) {
    const re = /[-+]?\d+(\.\d+)?/g;
    return svgPath
      .match(re)
      .map((match, i, matches) => {
        // Iterate to each pair of matches to rearrange the numbers in x and y
        // rectangular coordinates. Return null when the positioning is an odd number
        // Later the null's will be removed
        if (!(i % 2)) {
          const xPosition = +match;
          const yPosition = +matches.at(i + 1);
          return { xPosition, yPosition };
        }
        return null;
      })
      .filter((match) => match)
      .map((match, i) => ({
        ...match,
        y: serieValues.at(i).value,
        category: serieValues.at(i).category,
      }));
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
   * const chart = new RadarChart({
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
      .data(this.seriesShown)
      .join("rect")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} legend`)
      .attr("width", config.size)
      .attr("height", config.size)
      .attr("y", (_, i) => (config.size + config.spacing) * i)
      .style("fill", (d) => this.colorScale(d));

    legendGroup
      .selectAll("text")
      .data(this.seriesShown)
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
   * const chart = new RadarChart({
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
    const titleGroup = this._svg.append("g").attr("class", "chart-title");
    titleGroup
      .append("text")
      .attr("x", this.width() * config.widthOffset)
      .attr("y", this.height() * config.heightOffset)
      .text(config.title)
      .style("text-anchor", "middle");
  }
}
