import { scaleBand, format, select, selectAll } from "d3";
import RectangularGraph from "./rectangular_graph.js";

("use strict");

/**
 * Class to create an instance of a bar chart.
 * @extends RectangularGraph Class for the 2D in rectangular coordinates chart.
 */
class BarGraph extends RectangularGraph {
  /** @type {boolean} */
  #isNormalized;
  /** @type {boolean} */
  #isStacked;
  /** @type {boolean} */
  #isPercentage;
  /** @type {number} */
  /**
   * The sum of all data values
   * @type {number}
   */
  #grandTotal;
  /** @type {number} */
  #offsetAxis;
  /**
   * A D3.js scaleBand to make a grouped bar chart.
   * @type {any}
   */
  #secondScale;

  /**
   * @typedef {object} ySeries Data for the dependent series rearranged to create a bar chart.
   * @property {string} category The name of the category serie.
   * @property {number} value The value of a datum for the a serie.
   * @property {number} previous The previous value of a datum for the a serie. This property helps to draw the positioning of the stacked bar chart.
   * @property {number} next The sum of the current value datum and the previous value. This property helps to draw the width or height.
   */

  /**
   * @typedef {Array<{x: any, y: Array<ySeries>, total: number}>} rearrangedData The array of data objects arranged to draw the bar chart.
   */

  /**
   * @type {rearrangedData}
   */
  #data;

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
   * @typedef {object} configBarChartOptions The config for the bar chart.
   * @property {Array<any>} rawData The raw data for the chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} independentScale The D3.js scale to apply for the independent variable data.
   * @property {D3Scale} dependentScale The D3.js scale to apply for the dependent variable data.
   * @property {D3Scale} colorScale The D3.js scale for the colors to apply per each data serie.
   * @property {D3Axis} independentAxis The D3.js object generator for the independent axis variable.
   * @property {D3Axis} dependentAxis The D3.js object generator for the dependent axis variable.
   * @property {string} [independentAxisPosition="bottom"] The position of the independent axis. The positions of the axis are: "top", "right", "bottom" and "left". By default the independent axis position is "bottom".
   * @property {string} [dependentAxisPosition="left"] The position of the dependent axis. The positions of the axis are: "top", "right", "bottom" and "left". By default the independent axis position is "left".
   * @property {boolean} [isNormalized=false] Optional parameter to show the data in whether normalized or not per category. By default the normalization is not applied (false).
   * @property {boolean} [isStacked=true] Optional parameter to show the graph whether is stacked or grouped. By default the bar stacking is applied (true).
   * @property {boolean} [isPercentage=false] Optional parameter to show the data in whether in percentage or by the given values. The percentage representation is each value divided by sum of all values. By default the percentage representation is not applied (false).
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [factor=0.8] The factor value to position the legend for the chart. By default the factor is 0.8.
   * @property {number} [offsetAxis=0.05] The offset limits for the domain of the dependent variable for better visualization. By default the axis offset is 0.05.
   */

  /**
   * Create a new instance of the Bar chart class.
   * @param {configBarChartOptions} ConfigBarChart The options parameters for the new instance.
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
    independentAxisPosition = "bottom",
    dependentAxisPosition = "left",
    isNormalized = false,
    isStacked = true,
    isPercentage = false,
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
      independentAxisPosition,
      dependentAxisPosition,
      margins,
      factor,
    });
    this.setIsNormalized = isNormalized;
    this.setIsStacked = isStacked;
    this.setIsPercentage = isPercentage;
    this.setOffsetAxis = offsetAxis;
    this.#grandTotal = rawData
      .map((datum) =>
        this.dependentSeries.reduce((total, serie) => total + datum[serie], 0)
      )
      .reduce((allTotal, total) => allTotal + total, 0);
    this.#data = rawData
      .map((datum) => {
        /**
         * Accumulator variable to know the previous value in current iteration.
         * @type {number}
         */
        let before = 0;
        /**
         *  Total sum of all series in the current iteration.
         * @type {number}
         */
        const totalPerCategory = this.dependentSeries.reduce(
          (total, serie) => total + datum[serie],
          0
        );
        return {
          x: datum[this.independentSerie],
          y: this.dependentSeries
            .map((serie) => {
              /**
               * Factor to divide the datum value in case the percentage representation is required.
               * @type {number}
               */
              const percentageFactor = this.isPercentage ? this.grandTotal : 1;
              /**
               * Factor to divide the datum value per category in case normalized representation is required.
               * @type {number}
               */
              const normalizationFactor = this.isNormalized
                ? totalPerCategory
                : 1;
              /** @type {ySeries} */
              const info = {
                category: serie,
                value: datum[serie] / (percentageFactor * normalizationFactor),
                previous: before / (percentageFactor * normalizationFactor),
                next:
                  (1 / (percentageFactor * normalizationFactor)) *
                  (datum[serie] + before),
              };
              before += datum[serie];
              return info;
            })
            .sort((a, b) => b.value - a.value),
          total: totalPerCategory,
        };
      })
      .sort((a, b) => b.total - a.total);
    this._setIndependentScale = independentScale.domain(
      this.data.map((datum) => datum.x)
    );
    this._setDependentScale = dependentScale.domain([
      0,
      (1 + this.offsetAxis) *
        (this.isStacked
          ? this.data
              .map((datum) =>
                datum.y.reduce((total, serie) => total + serie.value, 0)
              )
              .reduce(
                (highestTotal, total) => Math.max(highestTotal, total),
                Number.NEGATIVE_INFINITY
              )
          : this.data
              .map((datum) =>
                datum.y.reduce(
                  (highest, serie) => Math.max(highest, serie.value),
                  Number.NEGATIVE_INFINITY
                )
              )
              .reduce(
                (highestMax, highest) => Math.max(highestMax, highest),
                Number.NEGATIVE_INFINITY
              )),
    ]);
    this.#secondScale = scaleBand()
      .domain(this.dependentSeries)
      .range([0, this._independentScale.bandwidth()]);
  }

  /**
   * The arranged data for the bar chart.
   * @returns {rearrangedData}
   */
  get data() {
    return this.#data;
  }

  /**
   * The sum of all data series.
   * @returns {number}
   */
  get grandTotal() {
    return this.#grandTotal;
  }

  /**
   * Whether the bar chart is stacked or not.
   * @returns {boolean}
   */
  get isStacked() {
    return this.#isStacked;
  }

  /**
   * @param {boolean} isStacked Whether the bar chart is stacked or not.
   */
  set setIsStacked(isStacked) {
    if (typeof isStacked !== "boolean") {
      throw new Error(`The ${isStacked} is not a boolean`);
    }
    this.#isStacked = isStacked;
  }

  /**
   * Whether the bar chart data is normalized per each serie.
   * @returns {boolean}
   */
  get isNormalized() {
    return this.#isNormalized;
  }

  /**
   * @param {boolean} isNormalized Whether the data is normalized by category.
   */
  set setIsNormalized(isNormalized) {
    if (typeof isNormalized !== "boolean") {
      throw new Error(`The ${isNormalized} is not a boolean`);
    }
    this.#isNormalized = isNormalized;
  }

  /**
   * The D3.js scale band for the grouped bar chart.
   * @returns {D3Scale}
   * @protected
   */
  get _secondScale() {
    return this.#secondScale;
  }

  /**
   * Whether the bar chart data is represented in percentage or not.
   * @returns {boolean}
   */
  get isPercentage() {
    return this.#isPercentage;
  }

  /**
   * @param {boolean} isPercentage Whether the data is represented by percentage of the total.
   */
  set setIsPercentage(isPercentage) {
    if (typeof isPercentage !== "boolean") {
      throw new Error(`The ${isPercentage} is not a boolean`);
    }
    this.#isPercentage = isPercentage;
  }

  /**
   * The percentage of the offset domain limits for the dependent axis dominant.
   * @returns {number}
   */
  get offsetAxis() {
    return this.#offsetAxis;
  }

  /**
   * @param {number} value A value between 0 and 1.
   */
  set setOffsetAxis(value) {
    if (value <= 0 || value >= 1) {
      throw new Error("The value must be between 0 and 1");
    }
    this.#offsetAxis = value;
  }

  /**
   * Selects the translate string for the g svg element according to positions of the bar chart (horizontal or vertical).
   * @param {number} offsetMargin The amount of margin to positioning the group svg element.
   * @param {string} position The positioning of the independent axis.
   * @returns {string} The translate string for the group svg element to move it.
   */
  #translateElement(offsetMargin, position) {
    const translations = {
      top: `translate(${offsetMargin}, 0)`,
      right: `translate(0, ${offsetMargin})`,
      bottom: `translate(${offsetMargin}, 0)`,
      left: `translate(0, ${offsetMargin})`,
    };
    return translations[position] || `translate(${offsetMargin}, 0)`;
  }

  /**
   * @typedef {object} barsConfig The configuration of the positioning of the bars in function of the horizontal or vertical direction of the bar chart.
   * @property {string} fixedSize The fixed size of svg rect element to draw the bar chart. The values are the width or the height of the svg rect element.
   * @property {string} variableSize The variable size of svg rect element to draw the bar chart. The values are the width or the height of the svg rect element.
   * @property {string} useIndex The starting x position to draw the grouped of the bar chart.
   * @property {string} usePrevious The previous of the lowest position to draw the bar chart.
   */

  /**
   * Evaluate the whether the bar chart is in horizontal or vertical position.
   * @returns {barsConfig}
   */
  #barsConfig() {
    if (this.horizontalPositions.includes(this.independentAxisPosition)) {
      return {
        fixedSize: "width",
        variableSize: "height",
        useIndex: "x",
        usePrevious: "y",
      };
    } else {
      return {
        fixedSize: "height",
        variableSize: "width",
        useIndex: "y",
        usePrevious: "x",
      };
    }
  }

  /**
   * Render the bars of the bars chart in the svg container.
   * @param {function} formatFunction The D3.js format function to appropiate format the value to show any datum. The default specifier is a value without decimal points.
   * @param {boolean} isStatic The optional parameter to decide if the bar chart has weather any interaction or it will be statically displayed. Bye default is false or interactive.
   * @returns {void}
   */
  renderBars(formatFunction = format(",.0f"), isStatic = false) {
    const gBars = this.D3Svg.append("g").attr("class", "bars");

    gBars
      .selectAll("g")
      .data(this.data)
      .join("g")
      .attr("class", (datum) => datum.x.replace(" ", "-").toLowerCase())
      .attr("transform", (datum) =>
        this.#translateElement(
          this._independentScale(datum.x),
          this.independentAxisPosition
        )
      );

    /** @type {barsConfig} */
    const positioning = this.#barsConfig();

    gBars
      .selectAll("g")
      .selectAll("rect")
      .data((datum) => datum.y)
      .join("rect")
      .attr(
        "class",
        (datum) =>
          `${datum.category.toLowerCase().replace(" ", "-")} hide unselected`
      )
      .attr(
        positioning.fixedSize,
        this.isStacked
          ? this._independentScale.bandwidth()
          : this._secondScale.bandwidth()
      )
      .attr(
        positioning.variableSize,
        (datum) =>
          (this.horizontalPositions.includes(this.independentAxisPosition)
            ? 1
            : -1) *
          (this._dependentScale(this._dependentScale.domain().at(0)) -
            this._dependentScale(datum.value))
      )
      .attr(positioning.useIndex, (_, index) =>
        this.isStacked ? 0 : this._secondScale.bandwidth() * index
      )
      .attr(positioning.usePrevious, (datum) =>
        this.isStacked
          ? this._dependentScale(
              this.verticalPositions.includes(this.dependentAxisPosition)
                ? datum.next
                : datum.previous
            )
          : this._dependentScale(
              this.verticalPositions.includes(this.dependentAxisPosition)
                ? datum.value
                : this._dependentScale.domain().at(0)
            )
      )
      .style("fill", (datum) => this._colorScale(datum.category));

    if (!isStatic) {
      return;
    }

    gBars
      .selectAll("g")
      .selectAll("text")
      .data((datum) => datum.y)
      .join("text")
      .attr(
        "class",
        (datum) =>
          `${datum.category.toLowerCase().replace(" ", "-")} hide unselected`
      )
      .attr(positioning.useIndex, (_, index) =>
        this.isStacked
          ? this._independentScale.bandwidth() / 2
          : this._secondScale.bandwidth() * index
      )
      .attr(positioning.usePrevious, (datum) =>
        this.isStacked
          ? this._dependentScale(datum.next)
          : this._dependentScale(datum.value)
      )
      .attr(
        this.verticalPositions.includes(this.dependentAxisPosition)
          ? "dx"
          : "dy",
        this.isStacked ? 0 : this._secondScale.bandwidth() / 2
      )
      .attr(
        this.verticalPositions.includes(this.independentAxisPosition)
          ? "dx"
          : "dy",
        this.verticalPositions.includes(this.independentAxisPosition) ? -15 : 15
      )
      .text((datum) => formatFunction(datum.value))
      .style("text-anchor", "middle");
  }

  /**
   * Add the tooltip HTML element to show a datum value when the mouse is over a point.
   * @param {function} formatFunction The D3.js format function to appropiate format the value to show any datum. The default specifier is a value without decimal points.
   * @returns {void}
   */
  addTooltip(formatFunction = format(",.0f")) {
    const gBars = this.D3Svg.select(".bars");
    // Add the tooltip element
    const tooltip = select("body")
      .append("span")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Add the event for the tooltip
    gBars
      .on("mouseover", (e) => {
        if (e.target.matches("rect")) {
          // Make solid the color of each category group
          /** @type {string} */
          const category = e.target.classList[0];
          selectAll(`.${category}`).style("opacity", 1);

          // Move the tooltip and show it
          tooltip
            .text(formatFunction(select(e.target).datum().value))
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY - 15}px`)
            .style("opacity", 1);
        }
      })
      .on("mouseout", (e) => {
        if (e.target.matches("rect")) {
          /** @type {string} */
          const category = e.target.classList[0];
          // Let CSS change the transparency
          selectAll(`.${category}`).style("opacity", null);
          // Hide the tooltip
          tooltip.style("opacity", 0);
        }
      });
  }

  /**
   * Add the legend with the colors and the category name of each serie
   * @param {number} squareSize The size of the square to draw a rect svg element.
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
      .data(this.dependentSeries)
      .join("rect")
      .attr("class", (datum) => datum)
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("y", (_, index) => (squareSize + 5) * index)
      .style("fill", (datum) => this._colorScale(datum));

    gLegends
      .selectAll("text")
      .data(this.dependentSeries)
      .join("text")
      .attr("x", squareSize + 5)
      .attr("y", (_, index) => (squareSize + 5) * index)
      .attr("dy", squareSize)
      .text((datum) => `${datum[0].toUpperCase()}${datum.slice(1)}`)
      .style("fill", (datum) => this._colorScale(datum));
  }

  /**
   * Add to each axis an arrow at the farthest distance.
   * @returns {void}
   */
  renderAxisArrows() {
    const gRows = this.D3Svg.append("g").attr("class", "axis arrows");
    gRows
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
      })
      .attr("transform", `translate(${this._independentScale.bandwidth()}, 0)`);

    gRows
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

  /**
   * Add the grid in y axis.
   * @returns {void}
   */
  renderYGrid() {
    const yGrid = this.D3Svg.append("g").attr("class", "y grid");
    yGrid
      .selectAll("line")
      .data(this._dependentScale.ticks())
      .join("line")
      .attr("x1", this._independentScale(this._independentScale.domain().at(0)))
      .attr("y1", (datum) => this._dependentScale(datum))
      .attr(
        "x2",
        this._independentScale(this._independentScale.domain().at(-1)) +
          this._independentScale.bandwidth()
      )
      .attr("y2", (datum) => this._dependentScale(datum));
  }
}

export default BarGraph;