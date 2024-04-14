import RectangularChart from "./rectangular-chart.mjs";

const { line, select, greatestIndex, leastIndex, scaleOrdinal } = d3;

("use strict");

export default class MultiLineChart extends RectangularChart {
  #radius;
  constructor() {
    super();
    this.#radius = 3;
  }

  /**
   * @description
   * Getter and setter for the radius property of the circles of the data points of the series.
   * @param {number} value The size of the radius in pixels for the circles in the series.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new MultiLineChart()
   *  .radius(5);
   * ```
   */
  radius(value) {
    return arguments.length && value >= 0
      ? ((this.#radius = +value), this)
      : this.#radius;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    const xValues = this.data().map((d) => d[this.xConfiguration().serie]);
    const xSerieRange = this._serieRange(xValues);

    // Set the scale for the values in the bottom position of the x axis
    this._x = this.xConfiguration()
      .scale.domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);

    const yValues = this.data().flatMap((d) =>
      this.yConfiguration().numericalSeries.map((serie) => d[serie])
    );
    const ySerieRange = this._serieRange(yValues);
    // Set the scale for the values in the left position of the y series
    this._y = this.yConfiguration()
      .scale.domain([
        (1 - this.yAxisOffset()) * ySerieRange.min,
        (1 + this.yAxisOffset()) * ySerieRange.max,
      ])
      .range([this.height() - this.margin().bottom, this.margin().top]);
    // Set the axes
    this._xAxis = this._D3Axis(this.xAxisConfig().position).scale(this.x);
    this._yAxis = this._D3Axis(this.yAxisConfig().position).scale(this.y);
    // Set the svg container of the chart
    this._setSvg();
    // Set the color schema
    this._colorScale = scaleOrdinal()
      .domain(this.yConfiguration().numericalSeries)
      .range(this.yConfiguration().colorSeries);
    // Set the the x axis customizations of format
    if (this.xAxisConfig().customizations) {
      for (const [xFormat, customFormat] of Object.entries(
        this.xAxisConfig().customizations
      )) {
        this.xAxis[xFormat](customFormat);
      }
    }
    // Set the y axis customizations of the y axis.
    if (this.yAxisConfig().customizations) {
      for (const [yFormat, customFormat] of Object.entries(
        this.yAxisConfig().customizations
      )) {
        this.yAxis[yFormat](customFormat);
      }
    }
  }

  /**
   * @description
   * Callback function to iterate throught a serie in the dataset by the serie name.
   * @param {object} row An object from the dataset.
   * @param {string} serie Name of the serie to get the data from the dataset.
   * @param {string} xSerieName The name of the x serie in the dataset.
   * @returns {{serie: string, x: number, y: number}}
   */
  getSerieData(row, serie, xSerieName) {
    return { serie, x: row[xSerieName], y: row[serie] };
  }

  /**
   * @description
   * Create the multiline series graph.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * char.addSeries();
   * ```
   */
  addSeries() {
    const groupSeries = this._svg.append("g").attr("class", "series");
    groupSeries
      .selectAll("g")
      .data(this.yConfiguration().numericalSeries)
      .join("g")
      .attr("class", (d) => d.toLowerCase().replace(" ", "-"));

    const pathGenerator = line()
      .x((d) => this.x(d.x))
      .y((d) => this.y(d.y));

    /**
     * @description
     * The rearranged data to drawn the line chart with the svg path element.
     * @param {string} serie The serie datum name.
     * @param {string} xSerieName The name of the x serie in the dataset.
     * @returns {[{serie: string, values: {x: number, y: number}[]}]}
     */
    const rearrangedData = (serie, xSerieName) => [
      {
        serie,
        values: this.data().map((row) => ({
          x: row[xSerieName],
          y: row[serie],
        })),
      },
    ];

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => rearrangedData(d, this.xConfiguration().serie))
      .join("path")
      .attr("class", (d) => `${d.serie} serie`)
      .attr("d", (d) => pathGenerator(d.values))
      .style("stroke", (d) => this.colorScale(d.serie))
      .style("fill", "none");
  }

  /**
   * @description
   * Add the circle elements to the points that forms each series in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * char.addPoints();
   * ```
   */
  addPoints() {
    // const seriesGroup = this._svg.selectAll(".series > g");
    const seriesGroup = this._svg.select(".series").selectChildren("g");
    seriesGroup
      .selectAll("circle")
      .data((d) =>
        this.data().map((row) =>
          this.getSerieData(row, d, this.xConfiguration().serie)
        )
      )
      .join("circle")
      .attr("class", (d) => `${d.serie} point`)
      .attr("cx", (d) => this.x(d.x))
      .attr("cy", (d) => this.y(d.y))
      .attr("r", this.radius());
  }

  /**
   * @description
   * Add the tooltip and the logic to the given elements in the chart.
   * @param {object} [config] The object with the following properties
   * @param {string} config.bindTo The CSS selector to bind the tooltip effects listeners to the DOM elements.
   * @param {callback} config.mouseover The logic to apply to the mouseover event.
   * @param {callback} config.mouseout The logic to apply to the mouseout event.
   * @param {object} config.tooltipStyles The object literal with the CSS styles to apply to the tooltip.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * char.coloringSeries({
   *    bindTo: ".series",
   *    mouseover: (e) => { console.log("Mouse over event", e.target); },
   *    mouseout: (e) => { console.log("Mouse out event", e.target); },
   *    toottipStyles: {
   *      opacity: "0",
   *      background: "#eeeeee",
   *      pointerEvents: "none",
   *      borderRadius: "2px",
   *      padding: "5px",
   *      position: "absolute",
   *      top: "0",
   *      left: "0",
   *      zIndex: "1",
   *    }
   * });
   * ```
   */
  addTooltip(
    config = {
      bindTo: ".series",
      mouseover: (e) => {
        if (e.target.matches(".point")) {
          const dotSelected = select(e.target);
          dotSelected.attr("r", 2 * this.radius());
          const coordinates = {
            x: this.xAxis.tickFormat()(dotSelected.datum().x),
            y: this.yAxis.tickFormat()(dotSelected.datum().y),
          };

          const tooltip = select(".tooltip");
          tooltip
            .style("opacity", 1)
            .style("left", `${e.pageX + 10}px`)
            .style("top", `${e.pageY - 15}px`)
            .text(`(${coordinates.x}, ${coordinates.y})`);
        }
      },
      mouseout: (e) => {
        if (e.target.matches(".point")) {
          // Desapear the tooltip
          const tooltip = select(".tooltip");
          tooltip.transition().duration(1000).style("opacity", 0);
          e.target.setAttribute("r", this.radius());
        }
      },
      tooltipStyles: {
        opacity: "0",
        background: "#eeeeee",
        pointerEvents: "none",
        borderRadius: "2px",
        padding: "5px",
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "1",
      },
    }
  ) {
    let tooltip = document.querySelector(".tooltip");

    // In case the tooltip element has not been created
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.setAttribute("class", "tooltip");
      // Set tooltip styles
      for (const css in config.tooltipStyles) {
        tooltip.style[css] = config.tooltipStyles[css];
      }
      document.body.append(tooltip);
    }

    for (const [listener, fn] of Object.entries(config)) {
      this._svg.selectAll(config.bindTo).on(listener, fn);
    }
  }

  /**
   * @description
   * Add the text elements for the critical points (min and max) to each series.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * char.addCriticalPoints();
   * ```
   */
  addCriticalPoints() {
    // What are the max and min point in each series and its x position
    const criticalPoints = this.yConfiguration().numericalSeries.reduce(
      (acc, serie) => {
        const currentSerie = this.data().map((d) => d[serie]);
        const maxIndex = greatestIndex(currentSerie);
        const minIndex = leastIndex(currentSerie);
        return {
          ...acc,
          [serie]: {
            max: Math.max(...currentSerie),
            min: Math.min(...currentSerie),
            maxPosition: this.data().at(maxIndex)[this.xConfiguration().serie],
            minPosition: this.data().at(minIndex)[this.xConfiguration().serie],
          },
        };
      },
      {}
    );

    const groupCritical = this._svg
      .append("g")
      .attr("class", "critical-points");

    for (const key in criticalPoints) {
      groupCritical
        .append("text")
        .attr("class", `${key} max`)
        .attr("x", this.x(criticalPoints[key].maxPosition))
        .attr("y", this.y(criticalPoints[key].max))
        .text(this.yAxis.tickFormat()(criticalPoints[key].max))
        .style("text-anchor", "middle");

      groupCritical
        .append("text")
        .attr("class", `${key} min`)
        .attr("x", this.x(criticalPoints[key].minPosition))
        .attr("y", this.y(criticalPoints[key].min))
        .text(this.yAxis.tickFormat()(criticalPoints[key].min))
        .style("text-anchor", "middle");
    }
  }

  /**
   * @description
   * Add the data label to each point the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * char.addLabels();
   * ```
   */
  addLabels() {
    const seriesGroup = this._svg.selectAll(".series").selectChildren("g");
    seriesGroup
      .selectAll("text")
      .data((d) =>
        this.data().map((row) =>
          this.getSerieData(row, d, this.xConfiguration().serie)
        )
      )
      .join("text")
      .attr("class", (d) => `${d.serie} label`)
      .attr("x", (d) => this.x(d.x))
      .attr("y", (d) => this.y(d.y))
      .text((d) => this.yAxis.tickFormat()(d.y));
  }
}
