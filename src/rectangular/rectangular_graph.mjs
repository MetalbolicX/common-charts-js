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
   * The HTML element of the svg container for the chart.
   * @returns {HTMLElement | null}
   */
  get svgElement() {
    return this.#svgElement;
  }

  /**
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
   * The width of the svg element container.
   * @returns {number}
   */
  get width() {
    return this.#svgWidth;
  }

  /**
   * The height of the svg element container.
   * @returns {number}
   */
  get height() {
    return this.#svgHeight;
  }

  /**
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
    this.#colorScale = colorScale;
  }

  /**
   * The D3.js object that creates the independent axis elements in a chart.
   * @returns {D3Axis}
   * @protected
   */
  get _independentAxis() {
    return this.#independentAxis;
  }

  /**
   * The D3.js object that creates the dependent axis elements in a chart.
   * @returns {D3Axis}
   * @protected
   */
  get _dependentAxis() {
    return this.#dependentAxis;
  }

  /**
   * The D3.js selection object selected by the svgSelector.
   * @returns {any}
   * @protected
   */
  get D3Svg() {
    return this.#D3Svg;
  }

  /**
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
   * The positions available for horizontal.
   * @returns {Array<string>}
   */
  get horizontalPositions() {
    return this.#horizontalPositions;
  }

  /**
   * The positions available for vertical.
   * @returns {Array<string>}
   */
  get verticalPositions() {
    return this.#verticalPositions;
  }

  /**
   * The set margins positioning of the chart.
   * @param {string} position The position of the axis.
   * @returns {number} By default it is the bottom position.
   */
  #axisPosition(position) {
    const positions = {
      top: this.margins.top,
      right: this.width - this.margins.right,
      bottom: this.height - this.margins.bottom,
      left: this.margins.left,
    };
    return positions[position] || this.height - this.margins.bottom;
  }

  /**
   * The translate string to move the svg g element.
   * @param {number} offsetMargin The quantity of the margin positioning.
   * @param {string} position The positioning of the axis.
   * @returns {string} By default is the horizontal positioning.
   */
  #translateAxis(offsetMargin, position) {
    const translations = {
      top: `translate(0, ${offsetMargin})`,
      right: `translate(${offsetMargin}, 0)`,
      bottom: `translate(0, ${offsetMargin})`,
      left: `translate(${offsetMargin}, 0)`,
    };
    return translations[position] || `translate(0, ${offsetMargin})`;
  }

  /**
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
   * @typedef {Object} labelInfo The label information to set the axes names.
   * @property {string} position The position of the axis label.
   * @property {string} title The title of the axis to be shown.
   * @property {number} delta The delta offset of the axis label.
   */

  /**
   * Show the axes labels at the farthest positions.
   * @param {labelInfo} independentAxisLabelInfo Data for the independent axis label.
   * @param {labelInfo} dependentAxisLabelInfo Data for the dependent axis label.
   * @returns {void}
   */
  renderAxesLabels(
    independentAxisLabelInfo = {
      position: "bottom",
      title: "[x axis]",
      delta: 4,
    },
    dependentAxisLabelInfo = {
      position: "left",
      title: "[y axis]",
      delta: 4,
    }
  ) {
    const gLabels = this.D3Svg.append("g").attr("class", "labels");
    gLabels
      .append("text")
      .attr("class", "x axis label")
      .attr(
        "x",
        independentAxisLabelInfo.position === "bottom"
          ? this.width - this.margins.right
          : this.margins.left
      )
      .attr(
        "y",
        independentAxisLabelInfo.position === "bottom"
          ? this.height - this.margins.bottom
          : this.margins.top
      )
      .attr("dx", independentAxisLabelInfo.delta)
      .text(independentAxisLabelInfo.title);

    gLabels
      .append("text")
      .attr("class", "y axis label")
      .attr(
        "x",
        dependentAxisLabelInfo.position === "left"
          ? this.margins.left
          : this.width - this.margins.right
      )
      .attr(
        "y",
        dependentAxisLabelInfo.position === "left"
          ? this.margins.top
          : this.height - this.margins.bottom
      )
      .attr("dy", -dependentAxisLabelInfo.delta)
      .text(dependentAxisLabelInfo.title);
  }

  /**
   * Show the title of the chart in the svg container.
   * @param {string} title The title to be displayed in the chart.
   * @returns {void}
   */
  renderTitle(title) {
    const gTitle = this.D3Svg.append("g").attr("class", "title");
    gTitle
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", this.margins.top)
      .text(title)
      .style("text-anchor", "middle");
  }

  /**
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
