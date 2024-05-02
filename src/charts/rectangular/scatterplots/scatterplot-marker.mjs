import ScatterPlot from "./scatterplot-chart.mjs";

("use strict");

/**
 * @description
 * ScattePlotMarker represents a chart in rectangular coordinates.
 * @class
 * @extends ScatterPlot
 */
export default class ScatterPlotMarker extends ScatterPlot {
  /**
   * @description
   * Object whicj stores some examples of the marker figures to draw in chart.
   * @type {{[key: string]: string}}
   * */
  #markers = {
    sun: "M5.114,5.726c0.169,0.168,0.442,0.168,0.611,0c0.168-0.169,0.168-0.442,0-0.61L3.893,3.282c-0.168-0.168-0.442-0.168-0.61,0c-0.169,0.169-0.169,0.442,0,0.611L5.114,5.726z M3.955,10c0-0.239-0.193-0.432-0.432-0.432H0.932C0.693,9.568,0.5,9.761,0.5,10s0.193,0.432,0.432,0.432h2.591C3.761,10.432,3.955,10.239,3.955,10 M10,3.955c0.238,0,0.432-0.193,0.432-0.432v-2.59C10.432,0.693,10.238,0.5,10,0.5S9.568,0.693,9.568,0.932v2.59C9.568,3.762,9.762,3.955,10,3.955 M14.886,5.726l1.832-1.833c0.169-0.168,0.169-0.442,0-0.611c-0.169-0.168-0.442-0.168-0.61,0l-1.833,1.833c-0.169,0.168-0.169,0.441,0,0.61C14.443,5.894,14.717,5.894,14.886,5.726 M5.114,14.274l-1.832,1.833c-0.169,0.168-0.169,0.441,0,0.61c0.168,0.169,0.442,0.169,0.61,0l1.833-1.832c0.168-0.169,0.168-0.442,0-0.611C5.557,14.106,5.283,14.106,5.114,14.274 M19.068,9.568h-2.591c-0.238,0-0.433,0.193-0.433,0.432s0.194,0.432,0.433,0.432h2.591c0.238,0,0.432-0.193,0.432-0.432S19.307,9.568,19.068,9.568 M14.886,14.274c-0.169-0.168-0.442-0.168-0.611,0c-0.169,0.169-0.169,0.442,0,0.611l1.833,1.832c0.168,0.169,0.441,0.169,0.61,0s0.169-0.442,0-0.61L14.886,14.274z M10,4.818c-2.861,0-5.182,2.32-5.182,5.182c0,2.862,2.321,5.182,5.182,5.182s5.182-2.319,5.182-5.182C15.182,7.139,12.861,4.818,10,4.818M10,14.318c-2.385,0-4.318-1.934-4.318-4.318c0-2.385,1.933-4.318,4.318-4.318c2.386,0,4.318,1.933,4.318,4.318C14.318,12.385,12.386,14.318,10,14.318 M10,16.045c-0.238,0-0.432,0.193-0.432,0.433v2.591c0,0.238,0.194,0.432,0.432,0.432s0.432-0.193,0.432-0.432v-2.591C10.432,16.238,10.238,16.045,10,16.045",
    twitter:
      "M18.258,3.266c-0.693,0.405-1.46,0.698-2.277,0.857c-0.653-0.686-1.586-1.115-2.618-1.115c-1.98,0-3.586,1.581-3.586,3.53c0,0.276,0.031,0.545,0.092,0.805C6.888,7.195,4.245,5.79,2.476,3.654C2.167,4.176,1.99,4.781,1.99,5.429c0,1.224,0.633,2.305,1.596,2.938C2.999,8.349,2.445,8.19,1.961,7.925C1.96,7.94,1.96,7.954,1.96,7.97c0,1.71,1.237,3.138,2.877,3.462c-0.301,0.08-0.617,0.123-0.945,0.123c-0.23,0-0.456-0.021-0.674-0.062c0.456,1.402,1.781,2.422,3.35,2.451c-1.228,0.947-2.773,1.512-4.454,1.512c-0.291,0-0.575-0.016-0.855-0.049c1.588,1,3.473,1.586,5.498,1.586c6.598,0,10.205-5.379,10.205-10.045c0-0.153-0.003-0.305-0.01-0.456c0.7-0.499,1.308-1.12,1.789-1.827c-0.644,0.28-1.334,0.469-2.06,0.555C17.422,4.782,17.99,4.091,18.258,3.266",
    facebook:
      "M11.344,5.71c0-0.73,0.074-1.122,1.199-1.122h1.502V1.871h-2.404c-2.886,0-3.903,1.36-3.903,3.646v1.765h-1.8V10h1.8v8.128h3.601V10h2.403l0.32-2.718h-2.724L11.344,5.71z",
    planet:
      "M19.432,7.157c-0.312-1.113-1.624-1.858-3.496-2.17c0.279,0.331,0.532,0.685,0.754,1.06c1.043,0.299,1.748,0.764,1.911,1.344c0.095,0.335,0.014,0.729-0.24,1.169c-0.274,0.476-0.768,1.007-1.455,1.542c0-0.034,0.005-0.067,0.005-0.101c0-3.816-3.094-6.91-6.91-6.91c-3.816,0-6.91,3.094-6.91,6.91c0,1.169,0.293,2.268,0.805,3.232c-1.366-0.277-2.303-0.805-2.495-1.487c-0.094-0.336-0.013-0.729,0.241-1.169c0.138-0.239,0.35-0.496,0.595-0.756c0.011-0.449,0.055-0.89,0.138-1.317c-1.398,1.144-2.112,2.386-1.805,3.476c0.338,1.205,1.845,1.98,3.968,2.24C5.8,15.854,7.774,16.91,10,16.91c3.389,0,6.201-2.44,6.791-5.659C18.735,9.951,19.795,8.448,19.432,7.157 M10,16.047c-1.651,0-3.147-0.664-4.238-1.738c0.147,0.005,0.295,0.008,0.447,0.008c1.502,0,3.195-0.212,4.941-0.658c1.734-0.443,3.297-1.064,4.595-1.776C14.952,14.299,12.682,16.047,10,16.047 M15.998,10.733c-1.27,0.797-2.973,1.554-5.062,2.088c-1.616,0.414-3.251,0.632-4.727,0.632c-0.427,0-0.827-0.025-1.213-0.061C4.338,12.425,3.954,11.258,3.954,10c0-3.339,2.707-6.046,6.046-6.046c3.34,0,6.047,2.708,6.047,6.046C16.047,10.249,16.027,10.492,15.998,10.733",
    mars: "m15,7 a 7,7 0 1,0 2,2 z l 1,1 7-7m-7,0 h 7 v 7",
    moon: "m15,3 a 8.5,8.5 0 1,0 0,13 a 6.5,6.5 0 0,1 0,-13",
    star: "m11,1 3,9h9l-7,5.5 2.5,8.5-7.5-5-7.5,5 2.5-8.5-7-6.5h9z",
    error404: "M3 3h18v18H3zM15 9l-6 6m0-6l6 6",
    gear: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  };
  /**
   * @description
   * The object to set the each category to a specific icon.
   * @type {{[key: string]: string}}
   */
  #markersConfiguration;
  /**
   * @description
   * The hexadecimal color to fill the icon marker.
   * @type {string}
   */
  #fillColor;
  /**
   * @description
   * Create a new instance of a ScatterPlotMarker object.
   * @constructor
   * @param {object} config The object for the constructor parameters.
   * @param {string} config.bindTo The css selector for the svg container to draw the chart.
   * @param {object[]} config.dataset The dataset to create the chart.
   * @example
   * ```JavaScript
   * const dataset = [
   *    { date: "12-Feb-12", europe: 52, asia: 40, america: 65 },
   *    { date: "27-Feb-12", europe: 56, asia: 35, america: 70 }
   * ];
   *
   * const chart = new ScatterPlotMarker({
   *    bindTo: "svg.chart",
   *    dataset
   * });
   * ```
   */
  constructor({ bindTo, dataset }) {
    super({ bindTo, dataset });
    this.#markersConfiguration = undefined;
    this.#fillColor = "#ccc";
  }

  /**
   * @description
   * Getter and setter of new markers to the default object to draw in the chart.
   * @param {{[key: string]: string}} marker Object which add new figures to draw in the chart. Keys are the figures and values are the svg path.
   * @returns {{[key: string]: string}|ScatterPlotMarker}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new ScatterPlotMarker({
   *    bindTo: "svg",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.markers({
   *    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
   *    instagram: "M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"
   * });
   * ```
   */
  markers(marker) {
    if (!arguments.length) {
      return this.#markers;
    }
    if (
      Object.entries(marker).every(
        ([key, value]) => typeof key === "string" && typeof value === "string"
      )
    ) {
      this.#markers = { ...this.#markers, ...marker };
    } else {
      console.error("The object keys and values must be strings");
    }
    return this;
  }

  /**
   * @description
   * Getter of the svg path to form a figure in the scatter plot.
   * @param {{[key: string]: string}} config The configuration object which the keys are the categories in a series and the values are the svg paths string to figure the marker.
   * @returns {{[key: string]: string}|ScatterPlotMarker}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new ScatterPlotMarker({
   *    bindTo: "svg",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.markersConfig({
   *    Exp1: "planet",
   *    Exp2: "star",
   *    Exp3: "sun"
   * });
   * ```
   */
  markersConfig(config) {
    return arguments.length && typeof config === "object"
      ? ((this.#markersConfiguration = { ...config }), this)
      : this.#markersConfiguration;
  }

  /**
   * @description
   * Getter and setter of the color to fill the markers.
   * @param {string} color The hexadecimal code for the color to fill the marker.
   * @returns {string|ScatterPlotMarker}
   */
  fillColor(color) {
    return arguments.length && typeof color === "string"
      ? ((this.#fillColor = color), this)
      : this.#fillColor;
  }

  /**
   * @description
   * Add all the series or just one series to the chart.
   * @param {string} name The name of the serie to draw if one one will be specified.
   * @returns {void}
   */
  #addSeries(name) {
    const seriesGroup = this.svg
      .selectAll(".series")
      .data([null])
      .join("g")
      .on("mouseover", (e) => this.listeners.call("mouseover", this, e))
      .on("mouseout", (e) => this.listeners.call("mouseout", this, e))
      .attr("class", "series");

    this._seriesShown = !name
      ? this.ySeries
      : this.ySeries.filter((serie) => serie === name);

    seriesGroup
      .selectAll(".serie")
      .data(this.seriesShown)
      .join("g")
      .attr("class", (d) => `${d.toLowerCase().replace(" ", "-")} serie`);

    const showMarkers = (paths) =>
      paths
        .style("opacity", 0)
        .transition(this.getTransition())
        .style("opacity", 1);

    seriesGroup
      .selectAll(".serie")
      .selectAll("path")
      .data((d) =>
        this.dataset.map((row) => ({
          ...this.getSerie(row, d),
          marker:
            this.markers()[
              this.markersConfig()[row[this.categoryConfiguration().serie]]
            ] || this.markers().error404,
        }))
      )
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => d.marker)
            .attr(
              "transform",
              (d) => `translate(${this.x(d.x)}, ${this.y(d.y)})`
            )
            .call(showMarkers),
        (update) => update.call(showMarkers),
        (exit) => exit.remove()
      )
      .attr(
        "class",
        (d) =>
          `${d.serie.toLowerCase().replace(" ", "-")} ${d.category
            .toLowerCase()
            .replace(" ", "-")} icon`
      )
      .style("fill", this.fillColor())
      .style("stroke", (d) => this.colorScale(d.category));
  }

  /**
   * @description
   * Creates the data points in the chart.
   * @returns {void}
   * @example
   * ```JavaScript
   * // Set all the parameters of the chart
   * const chart = new ScatterPlotMarker({
   *    bindTo: "svg",
   *    dataset
   * })
   * ...;
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
   * const chart = new ScatterPlotMarker({
   *    bindTo: "svg",
   *    dataset
   * })
   * ...;
   *
   * chart.init();
   * chart.addSerie();
   * ```
   */
  addSerie(name) {
    this.#addSeries(name);
  }
}
