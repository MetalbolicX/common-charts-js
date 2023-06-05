const { select } = d3;

("use strict");

/**
 * Base class to work in a 2D polar coordinates chart.
 */
class PolarGraph {
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
  /** @type {number} */
  #tickQuantity = 0;
  /**
   * The minimum value of the width or height of svg container that will limit the range of the radius scale.
   * @type {number}
   */
  #circleConstraint = 0;
  /**
   * The x coordinate at the middle position in the svg container to center the axes.
   * @type {number}
   */
  #xPositionCenter = 0;
  /**
   * The y coordinate at the middle position in the svg container to center the axes.
   * @type {number}
   */
  #yPositionCenter = 0;
  /** @type {string} */
  #independentSerie = "";
  /** @type {Array<string>} */
  #dependentSeries = [];
  /**
   * The HTML element of the svg container for the chart, selected by the svgSelector.
   * @type {HTMLElement | null}
   */
  #svgElement;
  /** @type {number} */
  #svgWidth = 0;
  /** @type {number} */
  #svgHeight = 0;
  /** @type {string}*/
  #svgSelector;
  /**
   * @typedef {object} margins The margins for the chart. According to the D3.js conventions.
   * @property {number} top The top margin for the chart.
   * @property {number} right The right margin for the chart.
   * @property {number} bottom The bottom margin for the chart.
   * @property {number} left The left margin for the chart.
   */
  /** @type {margins} */
  #margins;
  /**
   * The D3.js selection object selected by the svgSelector.
   * @type {any}
   */
  #D3Svg;

  /**
   * @typedef {import("d3").Scale<Domain, Range>} D3Scale
   * @typedef {import("d3").Axis<Domain>} D3Axis
   */

  /**
   * The D3.js generator scale function to draw in radial scale.
   * @type {D3Scale}
   */
  #radiusScale;
  /**
   * The D3.js generator scale to color the different series drawn in the chart.
   * @type {D3Scale}
   */
  #colorScale;
  /**
   * The D3.js svg group element as the main container positioned at the center of the svg.
   * @type {any}
   */
  #mainSvgGroup;
  /** @type {number} */
  #factor = 0.5;
  /**
   * The maximum radius of the chart.
   * @type {number}
   */
  #circleRadius = 0;

  /**
   * @typedef {object} configPolarOptions The config for the 2D polar coordinates chart.
   * @property {string} [svgSelector="svg"] The CSS selector for the SVG container. By default select the first svg element.
   * @property {string} independentSerie The name of independent variable serie for the chart.
   * @property {Array<string>} dependentSeries The names of dependent series for the chart.
   * @property {D3Scale} radiusScale The D3.js generator scale function to draw in radial scale.
   * @property {D3Scale} colorScale The D3.js scale for the colors to apply per each data serie.
   * @property {margins} [margins={ top: 30, right: 50, bottom: 30, left: 50 }] The margins to apply in the chart. It's the convenstion by D3.js community. By default the margins applied are: { top: 30, right: 50, bottom: 30, left: 50 }.
   * @property {number} [tickQuantity=5] The number of circles to be drwan as the independent axis varaible. By default 5 circles will be shown.
   * @property {number} [factor=0.5] The factor value for the seperaction between independent variable circles axis. By default the factor is 0.5.
   */

  /**
   * Create a new instance of the 2D polar coordinates chart class.
   * @param {configPolarOptions} ConfigPolarChart The options parameters for the new instance.
   */
  constructor({
    svgSelector = "svg",
    independentSerie,
    dependentSeries,
    radiusScale,
    colorScale,
    margins = { top: 30, right: 50, bottom: 30, left: 50 },
    tickQuantity = 5,
    factor = 0.5,
  }) {
    this.setSvgSelector = svgSelector;
    this.setIndependentSerie = independentSerie;
    this.setFactor = factor;
    this.setDependentSeries = dependentSeries;
    this.setMargins = margins;
    this.setTickQuantity = tickQuantity;
    this.#svgElement = document.querySelector(this.svgSelector);
    this.#svgWidth = this.svgElement.clientWidth;
    this.#svgHeight = this.svgElement.clientHeight;
    const w = this.width - this.margins.left - this.margins.right;
    const h = this.height - this.margins.top - this.margins.bottom;
    this.#circleConstraint = Math.min(w, h);
    this.#xPositionCenter = w / 2 + this.margins.left;
    this.#yPositionCenter = h / 2 + this.margins.top;
    this._setRadiusScale = radiusScale.range([0, this.#circleConstraint / 2]);
    this.#colorScale = colorScale.domain(this.dependentSeries);
    this.#circleRadius = this._radiusScale(this._radiusScale.domain().at(1));
    this.#D3Svg = select(this.svgSelector);
    this.#mainSvgGroup = this.D3Svg.append("g")
      .attr("class", "main")
      .attr(
        "transform",
        `translate(${this.#xPositionCenter}, ${this.#yPositionCenter})`
      );
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
   * The maximum radius of the chart.
   * @returns {number}
   */
  get _circleRadius() {
    return this.#circleRadius;
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
   * The quantity of the axis circles to be shown in the independent variable axis.
   * @returns {number}
   */
  get tickQuantity() {
    return this.#tickQuantity;
  }

  /**
   * The quantity of the axis circles to be shown in the independent variable axis.
   * @param {number} tickQuantity
   */
  set setTickQuantity(tickQuantity) {
    if (tickQuantity < 2) {
      throw new Error("The quantity of ticks must be at least 2");
    }
    this.#tickQuantity = tickQuantity;
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
   * The D3.js generator scale object to draw the values of the dependent variable.
   * @returns {D3Scale}
   * @protected
   */
  get _radiusScale() {
    return this.#radiusScale;
  }

  /**
   * @param {D3Scale} radiusScale A D3.js generator scale object to draw the values of the dependent variable.
   * @protected
   */
  set _setRadiusScale(radiusScale) {
    this.#radiusScale = radiusScale;
  }

  /**
   * The D3.js generator object to draw the values of the dependent variable.
   * @returns {D3Scale}
   * @protected
   */
  get _colorScale() {
    return this.#colorScale;
  }

  /**
   * The D3.js svg group element as the main container positioned at the center of the svg.
   * @returns {any}
   */
  get mainSvgGroup() {
    return this.#mainSvgGroup;
  }

  /**
   * The factor value for the seperaction between independent variable circles axis.
   * @returns {number}
   */
  get factor() {
    return this.#factor;
  }

  /**
   * The factor value for the seperaction between independent variable circles axis.
   * @param {number} factor The factor value must be between 0 and 1.
   */
  set setFactor(factor) {
    if (factor <= 0 || factor >= 1) {
      throw new Error("Invalid input of factor. It must be between 0 and 1.");
    }
    this.#factor = factor;
  }

  /**
   * Show the ticks axis of the independent variable.
   * @returns {void}
   */
  renderCirclesAxes() {
    const ticks = Array.from(
      { length: this.tickQuantity },
      (_, index) => (this._circleRadius * index) / this.tickQuantity
    );

    const gAxes = this.mainSvgGroup.append("g").attr("class", "radial axes");

    const circlesAxes = gAxes
      .selectAll(".axes.ticks")
      .data(ticks)
      .join("g")
      .attr("class", "axes ticks");

    circlesAxes
      .append("circle")
      .attr("r", (datum) => this._radiusScale(datum))
      .attr("class", "x axis tick");

    circlesAxes
      .append("text")
      .attr("class", "x axis tick")
      .attr("dy", (datum) => this._radiusScale(datum))
      .text(String);
  }
}

export default PolarGraph;