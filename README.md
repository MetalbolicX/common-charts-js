
# common-charts-js

**D3.js**, the short name for <u>Data-Driven Documents</u>, is a JavaScript library for manipulating documents based on data. D3 helps to bind data to *HTML*, *SVG* and *CSS*. It provides a wide range of tools and functions that enable developers to create interactive and dynamic data visualizations.

**common-charts-js** solves the problem re write again and again the same code for the common data visualization charts (like line, bar, etc.). This is a library which has prebuild charts using the <u>Object Oriented Programming</u> classes of **ECMAScript 6**. The user only needs to import the class chart and provide the parameters to create it.

In addition the user knows D3.js, it is possible to customize more any of the pre build chart.

## Charts at disposal

The library has the next charts in the current version:

1. **Line** (single and multi series).
2. **Bar** (simple, grouped, stacked and normalized).
3. **Area** (single and multi series).
4. **Slope**.
5. **Radar**.

## Installation

```npm
npm i -S common-charts-js
```

# Usage

## How to download D3.js library

This library do not use the `npm install d3` to avoid the unnecessary loading `js` files of the whole `D3.js` library

In order to download `D3.js` and use it in a vanilla HTML in modern browsers, import D3 from [jsDelivr](https://www.jsdelivr.com/package/npm/d3) or [unpkg](https://unpkg.com/d3) or another <u>CDN</u>.

*Example of the import from unpkg*

```HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js" type="text/javascript"></script>
    <title>Import D3</title>
  </head>
  <body>
    <h1>Example of the common-charts.js library</h1>
    <svg class="chart"></svg>
    <script type="module" src="./firstgraph.js"></script>
  </body>
</html>
```

## How initialize a chart

1. Create a Javascript file. For example: `firstgraph.js`.
2. Impor the desired chart to be displayed. The **common-charts.js** library was written using the **ECMACScript 6 modules**.
```Javascript
// For example the multi line series graph
import { MultiLineGraph }  from "common-charts-js";
```
3. Create or fetch from a data source. **Always use an array of objects** data structure with data for the [independent variable and depend variable(s)](https://en.wikipedia.org/wiki/Dependent_and_independent_variables). The library will take care of creating a detailed data structure for binding the data to the `svg` elements.

For example, graph the next mathematical function $y = f(x) = x^2$
```Javascript
// Data to be displayed needs to be as an array of objects
const data /**@type {Array<{ x: number, y: number }>}*/ = [
    {x: 1, y: 1},
    {x: 2, y: 4},
    {x: 3, y: 9},
    {x: 4, y: 16},
    {x: 5, y: 25},
    {x: 6, y: 36},
    {x: 7, y: 49},
    {x: 8, y: 64},
    {x: 9, y: 81},
    {x: 10, y: 100}
];
```
4. Initalize the `class` of the `MultiLineGraph` imported. For more details, see the documentation.
```Javascript
const graph = new MultiLineGraph({
  rawData: data,
  svgSelector: "svg.chart",
  independentSerie: "x",
  dependentSeries: ["y"],
  independentScale: d3.scaleLinear(),
  dependentScale: d3.scaleLinear(),
  colorScale: d3.scaleOrdinal().range(schemeSet2),
  independentAxis: d3.axisBottom(),
  dependentAxis: d3.axisLeft(),
});
```
5. Start to draw the chart in the `svg` container of the `HTML` document.
```Javascript
// Draw the line of tthe dependent variable
graph.renderSeries();
// Draw the x axis the graph
graph.renderIndependentAxis();
// Draw the y axis the graph
graph.renderDependentAxis();
```
6. Example of chart displayed in the `svg` element.
<html>
  <svg class="chart">
    <g class="series">
      <g class="y">
        <path
          class="y"
          d="M50,119.957L72.222,117.362L94.444,113.037L116.667,106.982L138.889,99.198L161.111,89.683L183.333,78.438L205.556,65.464L227.778,50.759L250,34.325"
          style="fill: none; stroke: red"
          ></path>
        <text
          class="y hide unselected"
          x="250"
          y="34.324843825084095"
          dx="5"
          dy="-5"
          style="fill: rgb(102, 194, 165)"
          >
          y
        </text>
      </g>
    </g>
    <g
      class="x axis"
      transform="translate(0, 120)"
      fill="none"
      font-size="10"
      font-family="sans-serif"
      text-anchor="middle"
      >
      <path
        class="domain"
        stroke="currentColor"
        d="M50.5,6V0.5H250.5V6"
        ></path>
      <g class="tick" opacity="1" transform="translate(50.5,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">1</text>
      </g>
      <g class="tick" opacity="1" transform="translate(72.72222222222221,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">2</text>
      </g>
      <g class="tick" opacity="1" transform="translate(94.94444444444444,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">3</text>
      </g>
      <g class="tick" opacity="1" transform="translate(117.16666666666666,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">4</text>
      </g>
      <g class="tick" opacity="1" transform="translate(139.38888888888889,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">5</text>
      </g>
      <g class="tick" opacity="1" transform="translate(161.61111111111111,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">6</text>
      </g>
      <g class="tick" opacity="1" transform="translate(183.83333333333331,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">7</text>
      </g>
      <g class="tick" opacity="1" transform="translate(206.05555555555557,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">8</text>
      </g>
      <g class="tick" opacity="1" transform="translate(228.27777777777777,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">9</text>
      </g>
      <g class="tick" opacity="1" transform="translate(250.5,0)">
        <line stroke="currentColor" y2="6"></line>
        <text fill="currentColor" y="9" dy="0.71em">10</text>
      </g>
    </g>
    <g
      class="y axis"
      transform="translate(50, 0)"
      fill="none"
      font-size="10"
      font-family="sans-serif"
      text-anchor="end"
      >
      <path
        class="domain"
        stroke="currentColor"
        d="M-6,120.5H0.5V30.5H-6"
        ></path>
      <g class="tick" opacity="1" transform="translate(0,112.67203267659778)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">10</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,104.02234502642959)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">20</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,95.37265737626142)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">30</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,86.72296972609323)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">40</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,78.07328207592504)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">50</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,69.42359442575685)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">60</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,60.77390677558866)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">70</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,52.12421912542048)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">80</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,43.47453147525228)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">90</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,34.824843825084095)">
        <line stroke="currentColor" x2="-6"></line>
        <text fill="currentColor" x="-9" dy="0.32em">100</text>
      </g>
    </g>
  </svg>
</html>

# Limitations

Neither the *common-chart-js* and [D3](https://d3js.org/) are libraries for complex data cleaning. The recommended use of them are with **cleaned semi structured data** previously processed with another tool such as [Ms Excel](https://www.microsoft.com/en/microsoft-365/excel) or [Pandas for Python](https://pandas.pydata.org/) or any other software for data manipulation.

# Contributing
Anybody who wants to add or improve something, I invite you to collaborate directly in this repository: [common-charts-js](https://github.com/MetalbolicX/common-charts-js)

# License
common-charts-js is released under the [MIT License](https://opensource.org/licenses/MIT).