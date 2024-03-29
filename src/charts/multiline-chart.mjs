import Chart from "./chart.mjs";

const { line, select, greatestIndex, leastIndex, format } = d3;

/**
 * @description
 * MultiLineChart is a class to create an instance of a multi series chart using D3 js.
 * @class
 * @extends Chart
 */
export default class MultiLineChart extends Chart {
  #radius;
  constructor() {
    super();
    this.#radius = 3;
  }

  /**
   * @description
   * Getter and setter for the radius property of the circles of the data points of the series.
   * @param {number|string} value The size of the radius in pixels for the circles in the series.
   * @returns {number|this}
   * @example
   * ```JavaScript
   * const chart = new MultiLineChart()
   *  .radius(5);
   * ```
   */
  radius(value) {
    return arguments.length ? ((this.#radius = +value), this) : this.#radius;
  }

  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    this.xValues = this.data().map((d) => this.xSerie()(d));
    const xSerieRange = this._serieRange(this.xValues);

    // Set the scale for the values in the bottom position of the x axis
    this.x = this.xScale()
      .domain(Object.values(xSerieRange))
      .range([this.margin().left, this.width() - this.margin().right]);

    this.yValues = this.data().map((d) => this.ySeries()(d));
    const ySerieRange = this._serieRange(
      this.yValues.map((d) => Object.values(d)).flat()
    );

    // Set the scale for the values in the left position of the y series
    this.y = this.yScale()
      .domain([
        (1 - this.yAxisOffset()) * ySerieRange.min,
        (1 + this.yAxisOffset()) * ySerieRange.max,
      ])
      .range([this.height() - this.margin().bottom, this.margin().top]);

    // Set the axes
    this.xAxis = this._D3Axis(this.xAxisPosition()).scale(this.x);
    this.yAxis = this._D3Axis(this.yAxisPosition()).scale(this.y);

    // Set the column names of the y series
    this._ySeriesNames = Object.keys(this.yValues.at(0));
    // Set the svg container of the chart
    this._setSvg();
    // Set the color schema
    this.colorScale().domain(this._ySeriesNames);
    // Set the the x axis customizations of format
    if (this.xAxisCustomizations) {
      for (const [xFormat, customFormat] of Object.entries(
        this.xAxisCustomizations()
      )) {
        this.xAxis[xFormat](customFormat);
      }
    }

    // Set the y axis customizations of the y axis.
    if (this.yAxisCustomizations) {
      for (const [yFormat, customFormat] of Object.entries(
        this.yAxisCustomizations()
      )) {
        this.yAxis[yFormat](customFormat);
      }
    }
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
      .data(this._ySeriesNames)
      .join("g")
      .attr("class", (d) => d);

    const pathGenerator = line()
      .x((d) => this.x(d.category))
      .y((d) => this.y(d.value));

    groupSeries
      .selectAll("g")
      .selectAll("path")
      // Create an array with an object containing the name of the serie and all data for each series.
      .data((d) => [
        {
          serie: d,
          values: this.yValues.map((r, i) => ({
            category: this.xValues.at(i),
            value: r[d],
          })),
        },
      ])
      .join("path")
      .attr("class", (d) => `${d.serie} serie`)
      .attr("d", (d) => pathGenerator(d.values))
      .style("stroke", (d) => this.colorScale()(d.serie))
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
    const seriesGroup = this._svg.selectAll(".series > g");
    seriesGroup
      .selectAll("circle")
      // Create an array of object for each series to add a class and the position of each point
      .data((d) =>
        this.yValues.map((r, i) => ({
          serie: d,
          value: r[d],
          category: this.xValues.at(i),
        }))
      )
      .join("circle")
      .attr("class", (d) => `${d.serie} point`)
      .attr("cx", (d) => this.x(d.category))
      .attr("cy", (d) => this.y(d.value))
      .attr("r", this.radius())
      .attr("data-position", (d) => d.category);
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
            x: dotSelected.attr("data-position"),
            y: dotSelected.datum().value.toFixed(1),
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
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js format function to format the data displayed in the label. By default the function is d3.format(".1f"). See the link for more details.
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   * // Set a custom format for the postfix in a number
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * chart.init();
   * char.addCriticalPoints(customUnits.Format("$.2f"));
   * ```
   */
  addCriticalPoints(fnFormat = format(".1f")) {
    // What are the max and min point in each series and its x position
    const criticalPoints = this._ySeriesNames.reduce((acc, serie) => {
      const currentSerie = this.yValues.map((d) => d[serie]);
      const maxIndex = greatestIndex(currentSerie);
      const minIndex = leastIndex(currentSerie);
      return {
        ...acc,
        [serie]: {
          max: Math.max(...currentSerie),
          min: Math.min(...currentSerie),
          maxPosition: this.xValues.at(maxIndex),
          minPosition: this.xValues.at(minIndex),
        },
      };
    }, {});

    const groupCritical = this._svg
      .append("g")
      .attr("class", "critical-points");

    for (const key in criticalPoints) {
      groupCritical
        .append("text")
        .attr("class", `${key} max`)
        .attr("x", this.x(criticalPoints[key].maxPosition))
        .attr("y", this.y(criticalPoints[key].max))
        .text(fnFormat(criticalPoints[key].max))
        .style("text-anchor", "middle");

      groupCritical
        .append("text")
        .attr("class", `${key} min`)
        .attr("x", this.x(criticalPoints[key].minPosition))
        .attr("y", this.y(criticalPoints[key].min))
        .text(fnFormat(criticalPoints[key].min))
        .style("text-anchor", "middle");
    }
  }

  /**
   * @description
   * Add the data label to each point the chart.
   * @param {callback} [fnFormat=d3.format(".1f")] The D3 js format function to format the data displayed in the label. By default the function is d3.format(".1f"). See the link for more details.
   * @returns {void}
   * @see {@link https://d3js.org/d3-format}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new MultiLineChart()
   *  ...;
   * // Set a custom format for the postfix in a number
   * const customUnits = d3.formatLocale({
   *  currency: ["", "°C"],
   * });
   *
   * chart.init();
   * char.addLabels(customUnits.format("$.1f"));
   * ```
   */
  addLabels(fnFormat = format(".1f")) {
    const seriesGroup = this._svg.selectAll(".series > g");
    seriesGroup
      .selectAll("text")
      // Create an array of object for each series to add a class and the position of each point
      .data((d) =>
        this.yValues.map((r, i) => ({
          serie: d,
          value: r[d],
          category: this.xValues.at(i),
        }))
      )
      .join("text")
      .attr("class", (d) => `${d.serie} label`)
      .attr("x", (d) => this.x(d.category))
      .attr("y", (d) => this.y(d.value))
      .text((d) => fnFormat(d.value));
  }
}
