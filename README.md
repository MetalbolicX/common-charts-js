
<h1 style="font-size:2.5rem">common-charts-js</h1>

By José Martínez Santana

## Technologies used

<div align="center">
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer">
      <img  alt="JavaScript" height="50px" style="padding-right:10px;background=black" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"/>
  </a>
  <a href="https://d3js.org/" target="_blank" rel="noreferrer">
      <img  alt="D3js" height="50px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg"/>
  </a>
</div>

## Description

**D3**, the short name for <ins>Data-Driven Documents</ins>, is a JavaScript library for manipulating documents based on data. D3 helps to bind data to *HTML*, *SVG* and *CSS*. It provides a wide range of tools and functions that enable developers to create interactive and dynamic data visualizations.

**common-charts-js** solves the problem re write again and again the same code for the common data visualization charts (like line, bar, etc.). This is a library which has prebuild charts using the <ins>Object Oriented Programming</ins> classes of **ECMAScript 6**. The user only needs to import the class chart and provide the parameters to create it. In addition if the user knows D3, it is possible to customize more any of the pre build chart.

## Charts at disposal

The library has the next charts in the current version:

1. **Line** (single and multi series).
2. **Bar** (simple, grouped, stacked and normalized).
3. **Area** (single and multi series).
4. **Slope**.
5. **Radar**.

## Installation

1. Install [NodeJS](https://nodejs.org/en/download) on your computer.
2. Create a folder for your project.
3. Execute the next command in the terminal:
```npm
npm i -S common-charts-js
```

# Usage

## How to download D3 library

This library do not use the `npm install d3` to avoid the unnecessary loading `js` files of the whole `D3` library.

In order to download `D3` the lastest version and use it in a vanilla HTML in modern browsers, import `D3` from [jsDelivr](https://www.jsdelivr.com/package/npm/d3) or [unpkg](https://unpkg.com/d3) or another <ins>CDN</ins>.

*<ins>Example of the import from unpkg</ins>*

```HTML
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js" type="text/javascript"></script>
    <title>Import D3</title>
  </head>
  <body>
    <h1>Example of the common-charts-js library</h1>
    <svg class="chart"></svg>
    <script type="module" src="./firstgraph.js"></script>
  </body>
</html>
```

## How initialize a chart

1. Create a Javascript file. For example: `firstgraph.js`.
2. Impor the desired chart to be displayed. The **common-charts-js** library was written using the **ECMACScript 6 modules**. For example the multi line series graph.
```Javascript
import { MultiLineGraph }  from "common-charts-js";
```
3. Create or fetch from a data source. **Always use an array of objects** data structure with data for the [independent variable and depend variable(s)](https://en.wikipedia.org/wiki/Dependent_and_independent_variables). The library will take care of creating a detailed data structure for binding the data to the `svg` elements. For example, graph the next mathematical function $y = f(x) = x^2$.
```Javascript
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
4. Initalize the imported `class` of the `MultiLineGraph`. For more details, see the documentation.
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
graph.renderSeries();
graph.renderIndependentAxis();
graph.renderDependentAxis();
```

# Limitations

Neither the *common-chart-js* and *D3* are libraries for complex data cleaning. The recommended use of them are with **cleaned semi structured data** previously processed with another tool such as [Ms Excel](https://www.microsoft.com/en/microsoft-365/excel) or [Pandas for Python](https://pandas.pydata.org/) or any other software for data manipulation.

The user must have some previous knowledge about how to use **D3** in order to select the correct *scales* and *axis* to build the chart.

# Contributing
Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change. I invite you to collaborate directly in this repository: [common-charts-js](https://github.com/MetalbolicX/common-charts-js)

# License
common-charts-js is released under the [MIT License](https://opensource.org/licenses/MIT).