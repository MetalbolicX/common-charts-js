import PolarGraph from "./polar_graph.mjs";
const { select, format, lineRadial, curveLinearClosed, greatest } = d3;

("use strict");

/**
 * Class to create an instance of a radar series chart.
 * @extends PolarGraph Class for the 2D in polar coordinates chart.
 */
export class RadarGraph extends PolarGraph {
  /**
   * @typedef {object} margins The margins for the chart. According to the D3.js conventions.
   * @property {number} top The top margin for the chart.
   * @property {number} right The right margin for the chart.
   * @property {number} bottom The bottom margin for the chart.
   * @property {number} left The left margin for the chart.
   */

  /**
   * @typedef {import("d3").Scale<Domain, Range>} D3Scale
   */

  /**
   * @typedef {object} xSeries The rearranged datum independent variable for the categories and angles.
   * @property {string} category The categories of the independent variable.
   * @property {number} radians The angle in radians per the quantity of data rows.
   */

  /**
   * @typedef {object} ySeries The rearranged datum independent variable for the categories and angles.
   * @property {string} serie The categories of the independent variable.
   * @property {Array<number>} values The angle in radians per the quantity of data rows.
   */

  /**
   * @typedef {object} rearrangedData The data rearranged to graph the radar chart.
   * @property {Array<xSeries>} x The data for the independent variable.
   * @property {Array<ySeries>} y The data for dependent variable.
   */

  /** @type {rearrangedData} */
  #data;
  /**
   * The highest values of all ySeries values.
   * @type {number}
   */
  #highestValue = 0;
  /**
   * The count of all rows of data.
   * @type {number}
   */
  #rowsCount = 0;
  /**
   * An offset of the position the categories label. This adds and offset for the radius of the chart.
   * @type {number}
   */
  #deltaRadius = 0;

  /**
   * @typedef {object} configRadarChartOptions The config for the radar chart.
   * @property {Array<any>} rawData The raw data for the chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} radiusScale The D3.js scale to apply for the dependent variable data.
   * @property {D3Scale} colorScale The D3.js scale for the colors to apply per each data serie.
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [tickQuantity=5] The number of circles to be drwan as the independent axis varaible. By default 5 circles will be shown.
   * @property {number} [factor=0.5] The factor value for the seperaction between independent variable circles axis. By default the factor is 0.5.
   * @property {number} [deltaRadius=2] The offet of the names of the categories for the positioning label. By default the value is 2.
   */

  /**
   * Create a new instance of the radar chart class.
   * @param {configRadarChartOptions} ConfigRadarChart The options parameters for the new instance.
   */
  constructor({
    rawData,
    svgSelector = "svg",
    independentSerie,
    dependentSeries,
    radiusScale,
    colorScale,
    margins = { top: 30, right: 50, bottom: 30, left: 50 },
    tickQuantity = 5,
    factor = 0.5,
    deltaRadius = 2,
  }) {
    super({
      svgSelector,
      independentSerie,
      dependentSeries,
      radiusScale,
      colorScale,
      margins,
      tickQuantity,
      factor,
    });
    this.#rowsCount = rawData.length;
    this.#deltaRadius = deltaRadius;
    this.#data = {
      x: rawData.map((datum, index) => ({
        category: datum[this.independentSerie],
        radians: ((2 * Math.PI) / this.#rowsCount) * index,
      })),
      y: this.dependentSeries.map((serie) => ({
        serie,
        values: rawData.map((datum) => datum[serie]),
      })),
    };
    this.#highestValue = this.data.y.reduce(
      (highest, datum) => Math.max(highest, ...datum.values),
      Number.NEGATIVE_INFINITY
    );
    this._radiusScale = radiusScale.domain([
      0,
      (1 + this.factor) * this.highestValue,
    ]);
  }

  /**
   * The re arranged data
   * @returns {rearrangedData}
   */
  get data() {
    return this.#data;
  }

  /**
   * The highest values of all ySeries values.
   * @returns {number}
   */
  get highestValue() {
    return this.#highestValue;
  }

  /**
   * The quantity of rows of data.
   * @returns {number}
   */
  get rowsCount() {
    return this.#rowsCount;
  }

  /**
   * An offset of the position the categories label. This adds and offset for the radius of the chart.
   * @returns {number}
   */
  get _deltaRadius() {
    return this.#deltaRadius;
  }

  /**
   * @typedef {object} coordinate The x, y and values rectangular coordinates for each datum.
   * @property {number} x The x coordinate in rectangular coordinates.
   * @property {number} y The y coordinate in rectangular coordinates.
   * @property {number} value The value of the datum.
   */

  /**
   * @param {string} svgPath The string of the SVG path element.
   * @param {Array<number>} serieValues The values of data points.
   * @returns {Array<coordinate>}
   */
  #extractPointsCoordinates(svgPath, serieValues) {
    const regex = /[-+]?\d+(\.\d+)?/g;
    return svgPath
      .match(regex)
      .map((match, index, matches) => {
        // Iterate to each pair of matches to rearrange the numbers in x and y
        // rectangular coordinates. Return null when the positioning is an odd number
        // Later the null's will be removed
        if (index % 2 === 0) {
          const x = +match;
          const y = +matches.at(index + 1);
          return { x, y };
        }
        return null;
      })
      .filter((match) => match !== null)
      .map((match, index) => ({
        ...match,
        value: serieValues.at(index),
      }));
  }

  /**
   * Show the lines of categories
   * @returns {void}
   */
  renderLinesAxes() {
    const gLines = this.mainSvgGroup.append("g").attr("class", "lines axes");

    const linesAxes = gLines
      .selectAll(".lines.ticks")
      .data(this.data.x)
      .join("g")
      .attr("class", "lines ticks");

    linesAxes
      .append("line")
      .attr("class", "y axis tick")
      .attr("x2", (datum) => this._circleRadius * Math.cos(datum.radians))
      .attr("y2", (datum) => this._circleRadius * Math.sin(datum.radians));

    linesAxes
      .append("text")
      .attr("class", "y axis tick")
      .attr("x", (datum) => this._circleRadius * Math.sin(datum.radians))
      .attr("y", (datum) => -this._circleRadius * Math.cos(datum.radians))
      .attr("dx", (datum) => this._deltaRadius * Math.sin(datum.radians))
      .attr("dy", (datum) => -this._deltaRadius * Math.cos(datum.radians))
      .text((datum) => datum.category);
  }

  /**
   * Add the series lines
   * @param {function} formatFunction The D3.js format function to display the customized datum. The default specifier is to represent a number without the decimal points.
   * @param {boolean} isStatic Whether the radar series chart is dynamically interactive or static.
   * @returns {void}
   */
  renderSeries(formatFunction = format(",.0f"), isStatic = false) {
    const gSeries = this.mainSvgGroup.append("g").attr("class", "series");

    const series = gSeries
      .selectAll("g")
      .data(this.data.y)
      .join("g")
      .attr("class", (datum) => datum.serie.toLowerCase().replace(" ", "-"));

    series
      .append("path")
      .attr(
        "class",
        (datum) => `${datum.serie.toLowerCase().replace(" ", "-")} serie`
      )
      .data(this.data.y.map((datum) => datum.values))
      .attr(
        "d",
        lineRadial()
          .radius((datum) => this._radiusScale(datum))
          .angle((_, index) => this.data.x.at(index).radians)
          .curve(curveLinearClosed)
      );

    series.each((datum, index, groups) => {
      const currentGroup = select(groups[index]);
      const xyCoordinates = this.#extractPointsCoordinates(
        currentGroup.selectChild("path").attr("d"),
        datum.values
      );

      currentGroup
        .selectAll("text")
        .data(xyCoordinates)
        .join("text")
        .attr("class", `${datum.serie} label unselected`)
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .text((d) => formatFunction(d.value));

      // Add the name of each serie and locate the label at the highest point of the serie
      const highestPerSerie = greatest(xyCoordinates, (d) => d.value);
      currentGroup
        .append("text")
        .attr("class", `${datum.serie} legend unselected`)
        .attr("x", highestPerSerie.x)
        .attr("y", highestPerSerie.y)
        .attr("dx", 5)
        .attr("dy", 5)
        .text(datum.serie);
    });

    if (!isStatic) {
      return;
    }

    // Color with each serie with the points and text to thw information in the graph
    // grouped per category
    series.each((datum, index, groups) => {
      const group = select(groups[index]);
      group.selectChild("path").style("stroke", this._colorScale(datum.serie));
      group
        .selectChildren(":not(path)")
        .style("fill", this._colorScale(datum.serie));
    });
  }

  /**
   * Add the tooltip element to show every datum in the chart.
   * @param {function} formatFunction The D3.js format function to display the customized datum. The default specifier is to represent a number without the decimal points.
   * @returns {void}
   */
  addToolTip(formatFunction = format(",.0f")) {
    const tooltip = select("body")
      .append("span")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const gSeries = this.mainSvgGroup.selectAll(".series > g");
    gSeries
      .on("mouseover", (e, d) => {
        const parent = select(e.target.parentElement);
        // Color all the elements in a group serie
        parent.selectChild("path").style("stroke", this._colorScale(d.serie));
        parent
          .selectChildren(":not(path)")
          .style("fill", this._colorScale(d.serie));

        // Show the name of the serie
        parent.selectChild(".legend").classed("unselected", false);

        if (e.target.matches("text.label")) {
          // Move the tooltip position
          tooltip
            .text(formatFunction(select(e.target).datum().value))
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY - 15}px`)
            .style("opacity", 1);
        }
      })
      .on("mouseout", (e) => {
        const parent = select(e.target.parentElement);
        //Remove the color
        parent.selectChild("path").style("stroke", null);
        parent.selectChildren(":not(path)").style("fill", null);
        // Hide the name of the serie
        parent.selectChild(".legend").classed("unselected", true);

        if (e.target.matches("text")) {
          // Hide the tooltip
          tooltip.transition().duration(200).style("opacity", 0);
        }
      });
  }
}

export default RadarGraph;
