import VBarChart from "./vertical-bar-chart.mjs";

const { scaleBand } = d3;

("use strict");

export default class HBarChart extends VBarChart {
  /**
   * @description
   * Start and set all the values for the D3 Scales, axis data rearranged data. Before creating the chart.
   * @returns {void}
   */
  init() {
    // Select the svg element container for the chart
    this._setSvg();
    // Set the column names of the y series
    this._ySeriesNames = Object.keys(this.ySeries()(this.data().at(0)));
    // Set the grant total
    this._setGrantTotal();
    // Rearrange the dataset
    this._reestructureData();
    // Set the x and y values
    this.xValues = this.data().map((d) => ({ category: d.category }));
    this.yValues = this.data().map((d) => ({
      values: d.values,
      total: d.total,
    }));

    const ySerieRange = this._serieRange(
      this.isStacked()
        ? this.yValues.map((d) => d.total)
        : this.yValues.map((d) => d.values.map((r) => r.value)).flat()
    );

    // Set the band scale for the nain categories
    this.x = this.xScale()
      .domain(this.xValues.map((d) => d.category))
      .range([this.margin().top, this.height() - this.margin().bottom])
      .paddingInner(this.innerPadding());

    // Set the bar chart horizontally
    this.y = this.yScale()
      .domain([0, (1 + this.yAxisOffset()) * ySerieRange.max])
      .range([this.margin().left, this.width() - this.margin().right]);

    // Set the color schema
    this.colorScale().domain(this._ySeriesNames);

    // Set the axes
    this.xAxis = this._D3Axis(this.xAxisPosition()).scale(this.x);
    this.yAxis = this._D3Axis(this.yAxisPosition()).scale(this.y);

    // Set the second scale for the grouped bar chart if the graph is not stacked
    this.x1 = scaleBand()
      .domain(this._ySeriesNames)
      .range([0, this.x.bandwidth()]);

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
   * Add the bars in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart()
   *  ...;
   *
   * chart.init();
   * chart.addBars();
   * ```
   */
  addBars() {
    const barsGroup = this._svg.append("g").attr("class", "bars");
    barsGroup
      .selectAll("g")
      .data(this.data())
      .join("g")
      .attr("transform", (d) => `translate(0, ${this.x(d.category)})`)
      .attr(
        "class",
        (d) => `${d.category.toLowerCase().replace(" ", "-")} bar-group`
      );

    barsGroup
      .selectAll("g")
      .selectAll("rect")
      .data((d) => d.values)
      .join("rect")
      .attr("class", (d) => `${d.category.toLowerCase().replace(" ", "-")} bar`)
      .attr(
        "height",
        this.isStacked() ? this.x.bandwidth() : this.x1.bandwidth()
      )
      .attr("width", (d) => this.y(d.value) - this.y(this.y.domain().at(0)))
      .attr("x", (d) =>
        this.isStacked() ? this.y(d.previous) : this.y(this.y.domain().at(0))
      )
      .attr("y", (d) => (this.isStacked() ? 0 : this.x1(d.serie)))
      .style("fill", (d) => this.colorScale()(d.serie));
  }

  /**
   * @description
   * Add the grid of the y axis to the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart()
   *  ...;
   *
   * chart.init();
   * chart.yGrid();
   * ```
   */
  yGrid() {
    const yGridGroup = this._svg.append("g").attr("class", "y grid");
    yGridGroup
      .selectAll("line")
      .data(this.y.ticks())
      .join("line")
      .attr("x1", (d) => this.y(d))
      .attr("y1", this.margin().top)
      .attr("x2", (d) => this.y(d))
      .attr("y2", this.height() - this.margin().bottom);
  }

  /**
   * @description
   * Add the labels with the values of each bar.
   * @param {number} [deltaX=-5] The quantity of pixels to move the label horizontally. By default is -5.
   * @param {number} [deltaY=5]  The quantity of pixels to move the label vertically. By default is 5.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new HBarChart()
   *  ...;
   *
   * chart.init();
   * chart.addLabels(-10, 6);
   * ```
   */
  addLabels(deltaX = -5, deltaY = 5) {
    const bars = this._svg.select(".bars");
    bars
      .selectAll("g")
      .selectAll("text")
      .data((d) => d.values)
      .join("text")
      .attr(
        "class",
        (d) => `${d.category.toLowerCase().replace(" ", "-")} text-label`
      )
      .attr("x", (d) =>
        this.isStacked() ? this.y(d.previous) : this.y(d.value)
      )
      .attr("y", (d) =>
        this.isStacked() ? this.x.bandwidth() / 2 : this.x1(d.serie)
      )
      .attr("dx", deltaX)
      .attr("dy", this.x1.bandwidth() / 2 + deltaY)
      .text((d) => this.yAxis.tickFormat()(d.value));
  }

  /**
   * @description
   * An arrow at the end of the x axis.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new VBarChart()
   *  ...;
   *
   * chart.init();
   * chart.xAxisArrow();
   * ```
   */
  xAxisArrow() {
    const arrowGroup = this._svg
      .selectAll(".axis.arrows")
      .data([null])
      .join("g")
      .attr("class", "axis arrows");

    arrowGroup
      .append("path")
      .attr("class", "x axis arrow")
      .attr("d", () => {
        const x1 = this.y(this.y.domain().at(-1));
        const x2 = this.y(this.y.domain().at(-1)) + 7;
        const y2 = this.height() - this.margin().bottom;
        const y1 = y2 - 3;
        const y3 = y2 + 3;
        return `M${x1},${y1},${x2},${y2},${x1},${y3}`;
      });
  }
}
