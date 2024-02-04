const { select } = d3;

("use strict");

/**
 * Base class to work in a 2D rectangular coordinates chart.
 */
class RectangularGraph {
  /**
   * The list of horizontal positioning of the chart allowed.
   * @type {Array<string>}
   * */
  #horizontalPositions = ["top", "bottom"];
  /**
   * The list of vertical positioning of the chart allowed.
   * @type {Array<string>}
   * */
  #verticalPositions = ["left", "right"];
  /**
   * The list of all positions of a chart allowed.
   * @type {Array<string>}
   * */
  #allPositions = [...this.#horizontalPositions, ...this.#verticalPositions];
  /** @type {string} */
  #independentSerie = "";
  /** @type {string} */
  #independentAxisPosition;
  /** @type {string} */
  #dependentAxisPosition;
  /** @type {Array<string>} */
  #dependentSeries = [];
  #dependentSeriesClass = [];
  /**
   * @typedef {Object} margins The margins for the chart. According to the D3.js conventions.
   * @property {number} top The top margin for the chart.
   * @property {number} right The right margin for the chart.
   * @property {number} bottom The bottom margin for the chart.
   * @property {number} left The left margin for the chart.
   */
  /** @type {margins} */
  #margins;
  /** @type {number} */
  #factor = 0.8;
  /** @type {string} */
  #svgSelector;
  /**
   * The HTML element of the svg container for the chart, selected by the svgSelector.
   * @type {HTMLElement | null}
   */
  #svgElement;
  /** @type {number} */
  #svgWidth = 0;
  /** @type {number} */
  #svgHeight = 0;

  /**
   * @typedef {import("d3").Scale<Domain, Range>} D3Scale
   * @typedef {import("d3").Axis<Domain>} D3Axis
   */

  /**
   * The D3.js generator scale function to draw the values of the independent variable.
   * @type {D3Scale}
   */
  #independentScale;
  /**
   * The D3.js generator scale function to draw the values of the dependent variable.
   * @type {D3Scale}
   */
  #dependentScale;
  /**
   * The D3.js generator scale function to color the different series drawn in the chart.
   * @type {D3Scale}
   */
  #colorScale;
  /**
   * The D3.js object which creates the independent axis elements in a chart.
   * @type {D3Axis}
   */
  #independentAxis;
  /**
   * The D3.js D3.js object which creates the dependent axis elements in a chart.
   * @type {D3Axis}
   */
  #dependentAxis;
  /**
   * The D3.js selection object selected by the svgSelector.
   * @type {any}
   */
  #D3Svg;

  /**
   * @typedef {object} configRectangularOptions The config for the 2D rectangular coordinates chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} independentScale The D3.js scale object to apply for the independent variable data.
   * @property {D3Scale} dependentScale The D3.js scale object to apply for the dependent variable data.
   * @property {D3Scale} colorScale The D3.js scale object for the colors to apply per each data serie.
   * @property {D3Axis} independentAxis The D3.js object for the independent axis variable.
   * @property {D3Axis} dependentAxis The D3.js object for the dependent axis variable.
   * @property {string} [independentAxisPosition="bottom"] The position of the independent axis. The positions of the axis are: "top", "right", "bottom" and "left". By default the independent axis position is "bottom".
   * @property {string} [dependentAxisPosition="left"] The position of the dependent axis. The positions of the axis are: "top", "right", "bottom" and "left". By default the independent axis position is "left".
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [factor=0.8] The factor value to position the legend for the chart. By default the factor is 0.8.
   */

  /**
   * Create a new instance of the 2D Rectangular coordinates chart class.
   * @param {configRectangularOptions} ConfigRectangularChart The options parameters for the new instance.
   */
  constructor({
    svgSelector = "svg",
    independentSerie,
    dependentSeries,
    independentScale,
    dependentScale,
    colorScale,
    independentAxis,
    dependentAxis,
    independentAxisPosition = "bottom",
    dependentAxisPosition = "left",
    margins = { top: 30, right: 50, bottom: 30, left: 50 },
    factor = 0.8,
  }) {
    this.setSvgSelector = svgSelector;
    this.setIndependentSerie = independentSerie;
    this.setIndependentAxisPosition = independentAxisPosition;
    this.setDependentAxisPosition = dependentAxisPosition;
    this.setDependentSeries = dependentSeries;
    this.setDependentSeriesClass = dependentSeries;
    this.setMargins = margins;
    this.setFactor = factor;
    this.#svgElement = document.querySelector(this.svgSelector);
    this.#svgWidth = this.svgElement.clientWidth;
    this.#svgHeight = this.svgElement.clientHeight;
    this._setIndependentScale = independentScale.range(
      this.horizontalPositions.includes(this.independentAxisPosition)
        ? [this.margins.left, this.width - this.margins.right]
        : [this.height - this.margins.bottom, this.margins.top]
    );
    this._setDependentScale = dependentScale.range(
      this.verticalPositions.includes(this.dependentAxisPosition)
        ? [this.height - this.margins.bottom, this.margins.top]
        : [this.margins.left, this.width - this.margins.right]
    );
    this.#independentAxis = independentAxis.scale(this._independentScale);
    this.#dependentAxis = dependentAxis.scale(this._dependentScale);
    this._setColorScale = colorScale;
    this.#D3Svg = select(this.svgSelector);
  }

  /**
   * @description
   * The CSS selector to select the svg container for the chart.
   * @returns {string}
   */
  get svgSelector() {
    return this.#svgSelector;
  }

  /**
   * @param {string} selector The CSS selector to select the svg container for the chart.
   */
  set setSvgSelector(selector) {
    if (typeof selector !== "string") {
      throw new Error(`The ${selector} is not an string`);
    }
    this.#svgSelector = selector;
  }

  /**
   * @description
   * The HTML element of the svg container for the chart.
   * @returns {HTMLElement | null}
   */
  get svgElement() {
    return this.#svgElement;
  }

  /**
   * @description
   * The factor to positioning the legend label in the chart.
   * @returns {number}
   */
  get factor() {
    return this.#factor;
  }

  /**
   * The factor to positioning the legend label in the chart.
   * @param {number} factor The factor value must be between 0 and 1.
   */
  set setFactor(factor) {
    if (factor <= 0 || factor >= 1) {
      throw new Error("Invalid input of factor. It must be between 0 and 1.");
    }
    this.#factor = factor;
  }

  /**
   * @description
   * The width of the svg element container.
   * @returns {number}
   */
  get width() {
    return this.#svgWidth;
  }

  /**
   * @description
   * The height of the svg element container.
   * @returns {number}
   */
  get height() {
    return this.#svgHeight;
  }

  /**
   * @description
   * The margins for the chart. According to the D3.js conventions.
   * @returns {margins}
   */
  get margins() {
    return this.#margins;
  }

  /**
   * The margins for the chart. According to the D3.js conventions.
   * @param {margins} margins
   */
  set setMargins(margins) {
    const positions = Object.keys(margins);
    positions.forEach((position) => {
      if (!this.#allPositions.includes(position)) {
        throw new Error(
          `Thw ${position} is not not a valid key for the margin object`
        );
      }
    });
    this.#margins = { ...margins };
  }

  /**
   * @description
   * The D3.js generator scale object to draw the values of the independent variable.
   * @returns {D3Scale}
   * @protected
   */
  get _independentScale() {
    return this.#independentScale;
  }

  /**
   * @param {D3Scale} independentScale A D3.js generator scale object to draw the values of the independent variable.
   * @protected
   */
  set _setIndependentScale(independentScale) {
    this.#independentScale = independentScale;
  }

  /**
   * @description
   * The D3.js generator object to draw the values of the dependent variable.
   * @returns {D3Scale}
   * @protected
   */
  get _dependentScale() {
    return this.#dependentScale;
  }

  /**
   * @param {D3Scale} dependentScale A D3.js generator objectto draw the values of the dependent variable.
   * @protected
   */
  set _setDependentScale(dependentScale) {
    this.#dependentScale = dependentScale;
  }

  /**
   * @description
   * The D3.js scale for the colors to apply per each data serie.
   * @returns {D3Scale}
   * @protected
   */
  get _colorScale() {
    return this.#colorScale;
  }

  /**
   * @param {D3Scale} colorScale The D3.js object scale for the colors to apply per each data serie.
   * @protected
   */
  set _setColorScale(colorScale) {
    this.#colorScale = colorScale.domain(this.dependentSeries);
  }

  /**
   * @description
   * The D3.js object that creates the independent axis elements in a chart.
   * @returns {D3Axis}
   * @protected
   */
  get _independentAxis() {
    return this.#independentAxis;
  }

  /**
   * @description
   * The D3.js object that creates the dependent axis elements in a chart.
   * @returns {D3Axis}
   * @protected
   */
  get _dependentAxis() {
    return this.#dependentAxis;
  }

  /**
   * @description
   * The D3.js selection object selected by the svgSelector.
   * @returns {any}
   * @protected
   */
  get D3Svg() {
    return this.#D3Svg;
  }

  /**
   * @description
   * The name of independent variable serie for the chart.
   * @returns {string}
   */
  get independentSerie() {
    return this.#independentSerie;
  }

  /**
   * @param {string} serieName The name of independent variable serie for the chart.
   */
  set setIndependentSerie(serieName) {
    if (typeof serieName !== "string") {
      throw new Error(`The ${serieName} is not an string`);
    }
    this.#independentSerie = serieName;
  }

  /**
   * @description
   * The names of dependent series for the chart.
   * @returns {Array<string>}
   */
  get dependentSeries() {
    return this.#dependentSeries;
  }

  /**
   * @param {Array<string>} seriesNames The names of dependent series for the chart.
   */
  set setDependentSeries(seriesNames) {
    this.#dependentSeries = [...seriesNames];
  }

  /**
   * @description
   * @returns {Array<string>}
   */
  get dependentSeriesClass() {
    return this.#dependentSeriesClass;
  }

  /**
   * @param {Array<string>} classSeries The names for the series to name the css selector.
   */
  set setDependentSeriesClass(classSeries) {
    this.#dependentSeriesClass = [
      ...classSeries.map((serie) => serie.toLowerCase().replace(" ", "-")),
    ];
  }

  /**
   * @description
   * The position of the independent axis variable.
   * @returns {string}
   */
  get independentAxisPosition() {
    return this.#independentAxisPosition;
  }

  /**
   * @param {string} position The position of the independent axis variable.
   */
  set setIndependentAxisPosition(position) {
    if (!this.#allPositions.includes(position)) {
      throw new Error(`The ${position} given is not a valid`);
    }
    this.#independentAxisPosition = position;
  }

  /**
   * @description
   * The position of the dependent axis variable.
   * @returns {string}
   */
  get dependentAxisPosition() {
    return this.#dependentAxisPosition;
  }

  /**
   * @param {string} position The position of the dependent axis variable.
   */
  set setDependentAxisPosition(position) {
    if (!this.#allPositions.includes(position)) {
      throw new Error(`The ${position} given is not a valid`);
    }
    this.#dependentAxisPosition = position;
  }

  /**
   * @description
   * The positions available for horizontal.
   * @returns {Array<string>}
   */
  get horizontalPositions() {
    return this.#horizontalPositions;
  }

  /**@description
   * The positions available for vertical.
   * @returns {Array<string>}
   */
  get verticalPositions() {
    return this.#verticalPositions;
  }

  /**
   * @description
   * The set margins positioning of the chart.
   * @param {string} position The position of the axis.
   * @returns {number} By default it is the bottom position.
   */
  #axisPosition(position) {
    /** @enum {number} */
    const positions = {
      top: this.margins.top,
      right: this.width - this.margins.right,
      bottom: this.height - this.margins.bottom,
      left: this.margins.left,
    };
    return positions[position] || this.height - this.margins.bottom;
  }

  /**
   * @description
   * The translate string to move the svg g element.
   * @param {number} offsetMargin The quantity of the margin positioning.
   * @param {string} position The positioning of the axis.
   * @returns {string} By default is the horizontal positioning.
   */
  #translateAxis(offsetMargin, position) {
    /** @enum {string} */
    const translations = {
      top: `translate(0, ${offsetMargin})`,
      right: `translate(${offsetMargin}, 0)`,
      bottom: `translate(0, ${offsetMargin})`,
      left: `translate(${offsetMargin}, 0)`,
    };
    return translations[position] || `translate(0, ${offsetMargin})`;
  }

  /**
   * @description
   * Show the independent axis variable in the svg container.
   * @returns {void}
   */
  renderIndependentAxis() {
    const translation = this.#axisPosition(this.independentAxisPosition);
    const translate = this.#translateAxis(
      translation,
      this.independentAxisPosition
    );

    this.D3Svg.append("g")
      .attr(
        "class",
        this.horizontalPositions.includes(this.independentAxisPosition)
          ? "x axis"
          : "y axis"
      )
      .attr("transform", translate)
      .call(this._independentAxis);
  }

  /**
   * @description
   * Show the dependent axis variable in the svg container.
   * @returns {void}
   */
  renderDependentAxis() {
    const translation = this.#axisPosition(this.dependentAxisPosition);
    const translate = this.#translateAxis(
      translation,
      this.dependentAxisPosition
    );

    this.D3Svg.append("g")
      .attr(
        "class",
        this.verticalPositions.includes(this.dependentAxisPosition)
          ? "y axis"
          : "x axis"
      )
      .attr("transform", translate)
      .call(this._dependentAxis);
  }

  /**
   * @typedef {Object} labelOptions The label information to set the axes names.
   * @property {string} position The position of the axis label.
   * @property {number} offset The offset of the axis label from the width or height at 0 level. By default 0.5 (50%).
   * @property {number} deltaX The delta offset of the x axis label.
   * @property {number} deltaY The delta offset of the y axis label.
   */

  /**
   * @description
   * Show an axis label at the farthest positions.
   * @param {string} title Title to name the axis.
   * @param {labelOptions} [labelOptions={ postion: "bottom", offset: 0.5, deltaX: 0, deltaY: 0 }] Data for the dependent axis label.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Show a axis label at the bottom axis and offset at the middlw.
   * graph.renderAxisLabel("Temperature", {
   *  position: "bottom",
   *  offset: 0.5
   *  deltaX: 5,
   *  deltaY: 0,
   * });
   * ```
   */
  renderAxisLabel(
    title,
    labelOptions = {
      position: "bottom",
      offset: 0.5,
      deltaX: 0,
      deltaY: this.margins.bottom,
    }
  ) {
    const gLabel = this.D3Svg.append("g").attr(
      "class",
      `axis-label ${labelOptions.position}`
    );

    if (labelOptions.position === "bottom" || labelOptions.position === "top") {
      gLabel
        .append("text")
        .attr("class", "x axis-label")
        .attr("x", labelOptions.offset * this.width)
        .attr(
          "y",
          labelOptions.position === "bottom"
            ? this.height - this.margins.bottom
            : this.margins.top
        )
        .attr("dx", labelOptions.deltaX)
        .attr("dy", labelOptions.deltaY)
        .text(title);
    } else {
      gLabel
        .append("text")
        .attr("class", "y axis-label")
        .attr("transform", `rotate(-90)`)
        .attr("x", -this.height * labelOptions.offset)
        .attr("y", 30)
        .attr("dx", labelOptions.deltaX)
        .attr("dy", labelOptions.deltaY)
        .text(title);
    }
  }

  /**
   * @description
   * Show the title of the chart in the svg container.
   * @param {string} title The title to be displayed in the chart.
   * @param {number} [percentage=0.5] The percentage of the svg width in which the title will be placed in the chart. By default it will be 0.5 (50%).
   * @returns {void}
   */
  renderTitle(title, percentage = 0.5) {
    const gTitle = this.D3Svg.append("g").attr("class", "main-title");
    gTitle
      .append("text")
      .attr("x", percentage * this.width)
      .attr("y", this.margins.top)
      .text(title)
      .style("text-anchor", "middle");
  }

  /**
   * @description
   * Show a pair of arrows at the farthest points of each axis.
   * @returns {void}
   */
  renderAxisRows() {
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
      });

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
}

export default RectangularGraph;
