import RectangularChart from "./rectangular-chart.mjs";

const { line, select, scaleOrdinal, transition } = d3;

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
    const xSerieRange = this._serieRange(
      this.data().map((d) => d[this.xConfiguration().serie])
    );
    // Set the scale for the values in the bottom position of the x axis
    this._x = this.xConfiguration()
      .scale.domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);
    // Set the names of the numerical series
    this._ySeries = Object.keys(
      this._getNumericalRow(this.data().at(0), [
        this.xConfiguration().serie,
        this.categorySerie(),
      ])
    );
    const ySerieRange = this._serieRange(
      this.data().flatMap((d) => this.ySeries.map((serie) => d[serie]))
    );
    this._setCriticalPoints();
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
      .domain(this.ySeries)
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
   * @returns {{serie: string, x: number, y: number}}
   */
  getSerieData(row, serie) {
    return { serie, x: row[this.xConfiguration().serie], y: row[serie] };
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const groupSeries = this._svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    groupSeries
      .selectAll("g")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => d.toLowerCase().replace(" ", "-"));

    const lineGenerator = line()
      .x((d) => this.x(d.x))
      .y((d) => this.y(d.y));

    /**
     * @description
     * The rearranged data to drawn the line chart with the svg path element.
     * @param {string} serie The serie datum name.
     * @returns {[{serie: string, values: {x: number, y: number}[]}]}
     */
    const rearrangedData = (serie) => [
      {
        serie,
        values: this.data().map((row) => ({
          x: row[this.xConfiguration().serie],
          y: row[serie],
        })),
      },
    ];

    const drawSeries = (selection) =>
      selection
        .delay((d, i) => i * (this.duration() / d.values.length))
        .attrTween("d", function (d) {
          /** @type {string}*/
          const linePath = lineGenerator(d.values);
          /** @type {number}*/
          const length = this.getTotalLength();
          return (/** @type {number}*/ time) =>
            linePath.substring(0, length * time); //
        })
        .style("stroke", (d) => this.colorScale(d));

    groupSeries
      .selectAll("g")
      .selectAll("path")
      .data((d) => rearrangedData(d))
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => lineGenerator(d.values))
            .style("fill", "none")
            .transition(this.getTransition())
            .call(drawSeries),
        (update) =>
          update
            .style("stroke", null)
            .transition(this.getTransition())
            .call(drawSeries),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.serie} serie`);
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
   * const chart = new MultiLineChart()
   *  ...;
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
   * Add the circle elements to the points that forms each series in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   *
   * chart.init();
   * chart.addPoints();
   * ```
   */
  addPoints() {
    const seriesGroup = this._svg.select(".series").selectChildren("g");

    const positionPoints = (selection) =>
      selection.attr("cx", (d) => this.x(d.x)).attr("cy", (d) => this.y(d.y));

    seriesGroup
      .selectAll("circle")
      .data((d) => this.data().map((row) => this.getSerieData(row, d)))
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("r", 0)
            .transition(this.getTransition())
            .attr("r", this.radius())
            .call(positionPoints),
        (update) =>
          update
            .attr("r", 0)
            .transition(this.getTransition())
            .delay((_, i) => i * 100)
            .attr("r", this.radius())
            .call(positionPoints),
        (exit) => exit.remove()
      )
      .attr("class", (d) => `${d.serie} point`)
      .style("fill", (d) => this.colorScale(d.serie));
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
   * chart.coloringSeries({
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
   * chart.addCriticalPoints();
   * ```
   */
  addCriticalPoints() {
    const groupCritical = this._svg
      .selectAll(".critical-points")
      .data([null])
      .join("g")
      .attr("class", "critical-points");

    const groupPoints = groupCritical
      .selectAll("g")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} max-and-min`);

    groupPoints
      .selectAll("text")
      .data((d) => this.criticalPoints[d])
      .join("text")
      .attr(
        "class",
        (d) => `${d.serie.toLowerCase().replace(" ", "-")} ${d.point}`
      )
      .transition(this.getTransition())
      .attr("x", (d) => this.x(d.x))
      .attr("y", (d) => this.y(d.y))
      .text((d) => this.yAxis.tickFormat()(d.y))
      .style("text-anchor", "middle");
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
   * chart.addLabels();
   * ```
   */
  addLabels() {
    const seriesGroup = this._svg.selectAll(".series").selectChildren("g");
    seriesGroup
      .selectAll("text")
      .data((d) => this.data().map((row) => this.getSerieData(row, d)))
      .join("text")
      .attr("class", (d) => `${d.serie} label`)
      .attr("x", (d) => this.x(d.x))
      .attr("y", (d) => this.y(d.y))
      .text((d) => this.yAxis.tickFormat()(d.y));
  }
}
