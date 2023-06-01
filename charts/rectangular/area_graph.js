import { select, area, greatestIndex } from "d3";
import { MultiLineGraph } from "./multiseries_graph";

("use strict");

/**
 * Class to create an instance of a multi areas series chart.
 * @extends MultiLineGraph Class for the multi lines series chart.
 */
export class MultiAreaGraph extends MultiLineGraph {
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
   * @typedef {object} configMultiAreaChartOptions The config for the multi areas chart.
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
   * Create a new instance of the Multi areas chart class.
   * @param {configMultiAreaChartOptions} ConfigMultiAreaChart The options parameters for the new instance.
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
      rawData,
      independentSerie,
      dependentSeries,
      independentScale,
      dependentScale,
      colorScale,
      independentAxis,
      dependentAxis,
      margins,
      factor,
      offsetAxis,
    });
  }

  /**
   * Show the multi areas series in the svg container.
   * @param {boolean} isStatic Whether the multi line series chart is dynamically interactive or static.
   * @param {number} deltaX The x position distance to ajust the text svg elements.
   * @param {number} deltaY The y position distance to ajust the text svg elements
   * @returns {void}
   */
  renderSeries(isStatic = false, deltaX = 5, deltaY = -5) {
    const gSeries = this.D3Svg.append("g").attr("class", "series");

    gSeries
      .selectAll("g")
      .data(this.data.y)
      .join("g")
      .attr("class", (datum) => datum.serie);

    gSeries
      .selectAll("g")
      .selectAll("path")
      .data((datum) => [datum.values])
      .join("path")
      .attr("class", function () {
        return select(this.parentElement).attr("class");
      })
      .attr(
        "d",
        area()
          .x0(this._independentScale(this._independentScale.domain().at(0)))
          .y0(this._dependentScale(this._dependentScale.domain().at(0)))
          .x((_, index) => this._independentScale(this.data.x.at(index)))
          .y1((datum) => this._dependentScale(datum))
      );

    // Add the name of the category to each line
    // Find the highest position per each category and save x and y positon,
    // so that it the text category label can be positioned
    const highestPerSerie = this.data.y.map((datum) => {
      const position = greatestIndex(datum.values);
      return {
        x: this.data.x.at(position),
        y: datum.values.at(position),
        serie: datum.serie,
      };
    });

    gSeries
      .selectAll("g")
      .selectAll("text")
      .data(highestPerSerie)
      .join("text")
      .attr("class", (datum) => `${datum.serie} hide unselected`)
      .attr("x", (datum) => this._independentScale(datum.x))
      .attr("y", (datum) => this._dependentScale(datum.y))
      .attr("dx", deltaX)
      .attr("dy", deltaY)
      .text((datum) => `${datum.serie[0].toUpperCase()}${datum.serie.slice(1)}`)
      .style("fill", (datum) => this._colorScale(datum.serie));

    // Add the color of each path in case the chart do not want to be interactive
    if (isStatic) {
      gSeries.selectAll("path").each((_, index, paths) => {
        const currentPath = select(paths[index]);
        const serie = currentPath.attr("class");
        currentPath.style("stroke", this._colorScale(serie));
      });
    }
  }
}
