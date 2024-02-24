import RectangularGraph from "./rectangular_graph.mjs";
const { extent, select, line, greatestIndex, selectAll, leastIndex } = d3;

("use strict");

/**
 * @description
 * Class for the creation a multi line series chart.
 * @extends RectangularGraph Class for the 2D in rectangular coordinates chart.
 */
export class MultiLineGraph extends RectangularGraph {
  /**
   * @typedef {object} ySerie The record of each y serie.
   * @property {string} serie The name of the serie.
   * @property {Array<number>} values The list of data values.
   */

  /**
   * @typedef {object} rearrangedData The object with data rearranged to plot the multi line series.
   * @property {Array<any>} x The list data for the x axis.
   * @property {Array<ySerie>} y The list of objects for the y axis to draw the lines.
   */

  /**
   * The object containing the rearranged data.
   * @type {rearrangedData}
   */
  #data;
  /** @type {number} */
  #offsetAxis;

  /**
   * @typedef {object} margins The margins for the chart. According to the D3.js conventions.
   * @property {number} top The top margin for the chart.
   * @property {number} right The right margin for the chart.
   * @property {number} bottom The bottom margin for the chart.
   * @property {number} left The left margin for the chart.
   */

  /**
   * @typedef {import("d3").Scale<Domain, Range>} D3Scale
   * @typedef {import("d3").Axis<Domain>} D3Axis
   */

  /**
   * @typedef {object} configMultiLinesChartOptions The config for the multi lines chart.
   * @property {Array<any>} rawData The raw data for the chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} independentScale The D3.js scale to apply for the independent variable data.
   * @property {D3Scale} dependentScale The D3.js scale to apply for the dependent variable data.
   * @property {D3Scale} colorScale The D3.js scale for the colors to apply per each data serie.
   * @property {D3Axis} independentAxis The D3.js object generator for the independent axis variable.
   * @property {D3Axis} dependentAxis The D3.js object generator for the dependent axis variable.
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [factor=0.8] The factor value to position the legend for the chart. By default the factor is 0.8.
   * @property {number} [offsetAxis=0.05] The offset limits for the domain of the dependent variable for better visualization. By default the axis offset is 0.05.
   */

  /**
   * @description
   * Creates a new instance of the Multi lines chart class. By the configuration options.
   * @param {configMultiLinesChartOptions} ConfigMultiLinesChart The options parameters for the new instance.
   * @example
   * ```JavaScript
   *
   * const data = [
   *    { year: 2014, temperature: 15, pressure: 0 },
   *    { year: 2015, temperature: 20, pressure: 50}
   * ];
   *
   * // Set the suffix of data of the left axis
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * const graph = new MultiLineGraph({
   *  rawData: data,
   *  svgSelector: "svg.chart",
   *  independentSerie: "year",
   *  dependentSeries: ["temperature", "pressure"],
   *  independentScale: d3.scaleLinear(),
   *  dependentScale: d3.scaleLinear(),
   *  colorScale: d3.scaleOrdinal().range(["red", "blue"]),
   *  independentAxis: d3.axisBottom().tickFormat(d3.format(".0f")),
   *  dependentAxis: d3.axisLeft().tickFormat(customUnits.format("$,.1f")),
   *  margins: { top: 50, right: 30, bottom: 50, left: 30},
   * });
   * ```
   */
  constructor({
    rawData,
    svgSelector,
    independentSerie,
    dependentSeries,
    independentScale,
    dependentScale,
    colorScale,
    independentAxis,
    dependentAxis,
    margins = { top: 30, right: 50, bottom: 30, left: 50 },
    factor = 0.8,
    offsetAxis = 0.05,
  }) {
    super({
      svgSelector,
      independentSerie,
      dependentSeries,
      independentScale,
      dependentScale,
      colorScale,
      independentAxis,
      dependentAxis,
      margins,
      factor,
    });
    this.setOffsetAxis = offsetAxis;
    this.#data = {
      x: rawData.map((d) => d[this.independentSerie]),
      y: this.dependentSeries.map((serie) => ({
        serie,
        values: rawData.map((d) => d[serie]),
      })),
    };
    this._setIndependentScale = independentScale.domain(extent(this.data.x));
    this._setDependentScale = dependentScale.domain([
      (1 - this.offsetAxis) *
        this.data.y
          .map((d) => Math.min(...d.values))
          .reduce((lowestMin, lowest) => Math.min(lowestMin, lowest), Infinity),
      (1 + this.offsetAxis) *
        this.data.y
          .map((d) => Math.max(...d.values))
          .reduce(
            (highestMax, highest) => Math.max(highestMax, highest),
            Number.NEGATIVE_INFINITY
          ),
    ]);
  }

  /**
   * @description
   * Show the arranged data for the creation of the chart.
   * @returns {rearrangedData}
   */
  get data() {
    return this.#data;
  }

  /**
   * @description
   * The percentage of the offset domain limits for the dependent axis dominant.
   * @returns {number}
   */
  get offsetAxis() {
    return this.#offsetAxis;
  }

  /**
   * @description
   * Setter for the offset domain limits for the dependent axis dominant.
   * @param {number} value A value between 0 and 1.
   */
  set setOffsetAxis(value) {
    if (value <= 0 || value >= 1) {
      throw new Error("The value must be between 0 and 1");
    }
    this.#offsetAxis = value;
  }

  /**
   * @description
   * Show the multi series lines in the svg container selected.
   * @returns {void}
   */
  renderSeries() {
    const gSeries = this.D3Svg.append("g").attr("class", "series");

    gSeries
      .selectAll("g")
      .data(this.data.y)
      .join("g")
      .attr("class", (_, i) => this.dependentSeriesClass.at(i));

    gSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => [d.values])
      .join("path")
      .attr("class", function () {
        return `${select(this.parentElement).attr("class")} serie`;
      })
      .attr(
        "d",
        line()
          .x((_, i) => this._independentScale(this.data.x.at(i)))
          .y((d) => this._dependentScale(d))
      )
      .style("fill", "none");

    // Add the color for each serie
    gSeries.selectAll("path").each((_, i, paths) => {
      const currentPath = select(paths[i]);
      const serie = currentPath.attr("class").split(" ").at(0);
      currentPath.style("stroke", this._colorScale(serie));
    });
  }

  /**
   * @description
   * Draw a data point and the value of the maximum and minimum points of the series.
   * @param {number} [radius=10] The radius size of the data point to draw for the critical points. By default the radius is 10 pixels.
   * @returns {void}
   */
  renderCriticalPoints(radius = 10) {
    // Find the point and the coordinate od the critical points
    const criticalPoints = this.data.y.map((serie, i) => {
      const maxIndex = greatestIndex(serie.values);
      const minIndex = leastIndex(serie.values);
      return {
        serieName: serie.serie,
        serieClass: this.dependentSeriesClass.at(i),
        maxXValue: this.data.x.at(maxIndex),
        maxYValue: serie.values.at(maxIndex),
        minXValue: this.data.x.at(minIndex),
        minYValue: serie.values.at(minIndex),
      };
    });

    selectAll(".series > g").each((_, i, n) => {
      const gSerie = select(n[i]);

      const gMaxGroup = gSerie
        .append("g")
        .attr("class", "group critical maximum")
        .attr(
          "transform",
          `translate(${this._independentScale(
            criticalPoints.at(i).maxXValue
          )}, ${this._dependentScale(criticalPoints.at(i).maxYValue)})`
        );

      gMaxGroup
        .append("circle")
        .attr("class", "maximum critical point")
        .attr("r", radius);

      gMaxGroup
        .append("text")
        .attr("class", "maximum critical label")
        .text(criticalPoints.at(i).maxYValue)
        .attr("dy", 4)
        .style("alignment-baseline", "middle")
        .style("text-anchor", "middle");

      const gMinGroup = gSerie
        .append("g")
        .attr("class", "group critical minimum")
        .attr(
          "transform",
          `translate(${this._independentScale(
            criticalPoints.at(i).minXValue
          )}, ${this._dependentScale(criticalPoints.at(i).minYValue)})`
        );

      gMinGroup
        .append("circle")
        .attr("class", "minimum critical point")
        .attr("r", radius);

      gMinGroup
        .append("text")
        .attr("class", "minimum critical label")
        .text(criticalPoints.at(i).minYValue)
        .attr("dy", 4)
        .style("alignment-baseline", "middle")
        .style("text-anchor", "middle");
    });
  }

  /**
   * @description
   * Add the tooltip element to see a datum. The tooltip uses a HTML table, so it can be styled with CSS.
   * @param {number} [radius=1] The size of the radius of each datum point that is displayed in a line serie By default the radius is 1 pixel.
   * @param {number} [lineWidth=2] The width of the line serie. By default the line stroke width is 2 pixels.
   * @returns {void}
   */
  addTooltip(radius = 1, lineWidth = 2) {
    const gSeries = this.D3Svg.selectAll(".series > g");

    // Add the circles data point
    gSeries
      .selectAll("circle")
      .data((d) => d.values)
      .join("circle")
      .attr("class", function () {
        const parentClass = select(this.parentElement).attr("class");
        return `${parentClass} dot`;
      })
      .attr("cx", (_, i) => this._independentScale(this.data.x.at(i)))
      .attr("cy", (d) => this._dependentScale(d))
      .attr("r", radius)
      .attr("data-position", (_, i) => this.data.x.at(i));

    // Add the tooltip element
    const tooltip = select("body")
      .insert("div", `${this.svgSelector} + *`)
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Add the event for the tooltip
    gSeries
      .on("mouseover", (e, d) => {
        // Increade the size of the stroke in the path and circe tags
        select(e.target.parentElement)
          .selectChildren(":is(path, circle)")
          .style("stroke-width", lineWidth);

        if (e.target.matches(".dot")) {
          // Show data point x and y value in the tooltp
          const pointSelected = select(e.target);
          const dataValues = {
            x: pointSelected.attr("data-position"),
            y: pointSelected.datum().toFixed(1),
          };

          pointSelected.attr("r", 3 * radius).style("stroke-width", lineWidth);

          // Add a HTML table for the data selected
          tooltip
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY - 15}px`)
            .style("opacity", 1).html(/*html*/ `
              <table class="tooltip-table">
                <caption>${d.serie}</caption>
                <thead>
                  <tr>
                    <th>${dataValues.x}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${dataValues.y}</td>
                  </tr>
                </tbody>
              </table>
            `);
        }
      })
      .on("mouseout", (e, _) => {
        if (e.target.matches(".dot")) {
          // Desapear the tooltip
          tooltip.transition().duration(1000).style("opacity", 0);
          select(e.target).attr("r", radius);
        }
        // Decrease the size of the stroke in the path and circle tag
        select(e.target.parentElement)
          .selectChildren(":is(path, circle)")
          .style("stroke-width", null);
      });
  }

  /**
   * @description
   * Show the legend refering for each color and name a serie.
   * @param {number} [squareSize=10] The size width and height to draw an svg square element for the legend. By default the size is 10 pixels.
   * @returns {void}
   */
  renderLegend(squareSize = 10) {
    const gLegends = this.D3Svg.append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${this.factor * this.width}, ${this.margins.top})`
      );

    gLegends
      .selectAll("rect")
      .data(this.data.y)
      .join("rect")
      .attr("class", (_, i) => this.dependentSeriesClass.at(i))
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("y", (_, i) => (squareSize + 5) * i)
      .style("fill", (d) => this._colorScale(d.serie));

    gLegends
      .selectAll("text")
      .data(this.data.y)
      .join("text")
      .attr("class", (_, i) => this.dependentSeriesClass.at(i))
      .attr("x", squareSize + 5)
      .attr("y", (_, i) => (squareSize + 5) * i)
      .attr("dy", squareSize)
      .text((d) => d.serie)
      .style("fill", (d) => this._colorScale(d.serie));
  }

  /**
   * @description
   * Show the grid of the x axis.
   * @returns {void}
   */
  renderXGrid() {
    const xGrid = this.D3Svg.append("g").attr("class", "x grid");
    xGrid
      .selectAll("line")
      .data(this._independentScale.ticks())
      .join("line")
      .attr("x1", (d) => this._independentScale(d))
      .attr("y1", this._dependentScale(this._dependentScale.domain().at(0)))
      .attr("x2", (d) => this._independentScale(d))
      .attr("y2", this._dependentScale(this._dependentScale.domain().at(1)));
  }

  /**
   * @description
   * Show the grid of the y axis.
   * @returns {void}
   */
  renderYGrid() {
    const yGrid = this.D3Svg.append("g").attr("class", "y grid");
    yGrid
      .selectAll("line")
      .data(this._dependentScale.ticks())
      .join("line")
      .attr("x1", this._independentScale(this._independentScale.domain().at(0)))
      .attr("y1", (d) => this._dependentScale(d))
      .attr("x2", this._independentScale(this._independentScale.domain().at(1)))
      .attr("y2", (d) => this._dependentScale(d));
  }

  /**
   * @description
   * Show a pair of arrows at the farthest distance of the axes..
   * @returns {void}
   */
  renderAxisArrows() {
    const gArrows = this.D3Svg.append("g").attr("class", "axis arrows");
    gArrows
      .append("svg:path")
      .attr("class", "x axis arrow")
      .attr("d", () => {
        const x1 = this._independentScale(
          this._independentScale.domain().at(-1)
        );
        const x2 =
          this._independentScale(this._independentScale.domain().at(-1)) + 7;
        const y2 = this._dependentScale(this._dependentScale.domain().at(0));
        const y1 = y2 - 3;
        const y3 = y2 + 3;
        return `M${x1},${y1},${x2},${y2},${x1},${y3}`;
      });

    gArrows
      .append("svg:path")
      .attr("class", "y axis arrow")
      .attr("d", () => {
        const y1 = this._dependentScale(this._dependentScale.domain().at(-1));
        const y2 =
          this._dependentScale(this._dependentScale.domain().at(-1)) - 7;
        const x2 = this._independentScale(
          this._independentScale.domain().at(0)
        );
        const x1 = x2 - 3;
        const x3 = x2 + 3;
        return `M${x1},${y1},${x2},${y2},${x3},${y1}`;
      });
  }
}

export default MultiLineGraph;
