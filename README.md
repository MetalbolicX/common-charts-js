# common-charts-js

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

**common-charts-js** while I was studying D3, creating a chart is a very manual process that requires to rewrite the same code all over again just for changing some parameters.

In addition inspired by the book [Create Web Charts with D3](http://www.apress.com/9781484208663) this library provides a solution for creating the most used data visualization charts (like line 📈, bar 📊, etc.).

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

In order to download [`D3` the lastest version](https://github.com/d3/d3/releases/latest) and use it in a vanilla HTML in modern browsers, import `D3` from [jsDelivr](https://www.jsdelivr.com/package/npm/d3) or [unpkg](https://unpkg.com/d3) or another <ins>CDN</ins>.

*<ins>Example of the import in the HTML `script` tag</ins>*
```HTML
<script src="https://d3js.org/d3.v7.js" type="text/javascript" charset="utf-8" language="javascript></script>
```

## How initialize a chart

1. Create a HTML file. Add the `D3` library, add `svg` element where the chart will be contained. Finally at a `script` tag of your code.
```HTML
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js" type="text/javascript" language="javascript" charset="utf-8"></script>
    <title>Common charts example</title>
  </head>
  <body>
    <h1>Example of how to use the common-charts-js library</h1>
    <svg class="chart"></svg>
    <script type="module" src="./firstgraph.js"></script>
  </body>
</html>
```
2. Create a file called `firstgraph.js`. Inside it, import the desired chart to be displayed. The **common-charts-js** library. They were written using the **ECMACScript 6 modules**. For example the multi line series graph.
```Javascript
import { SlopeChart }  from "common-charts-js";
```
3. Create of fetch a dataset as an array of objects. For example:
```Javascript
const data /**@type {{answer: string, last_year: number, this_year: number}[]}*/ = [{
    answer: "Strongly agree",
    last_year: 0.26,
    this_year: 0.33
  },
  {
    answer: "Agree",
    last_year: 0.5,
    this_year: 0.51
  },
  {
    answer: "Disagree",
    last_year: 0.22,
    this_year: 0.14
  },
  {
    answer: "Strongly disagree",
    last_year: 0.02,
    this_year: 0.02
  }
];
```
4. Initalize the chart. For more details, see the documentation.
```Javascript
const chartContainer = document.querySelector("svg");
const width = chartContainer.clientWidth;
const height = chartContainer.clientHeight;

const slopeChart = new SlopeChart()
  .bindTo("svg.chart")
  .width(width)
  .height(height)
  .margin({
    top: 50,
    right: 30,
    bottom: 50,
    left: 30,
  })
  .data(data)
  .xSerie((d) => d.answer)
  .ySeries((d) => ({
    "Last year": d.last_year,
    "This year": d.this_year
  }))
  .xScale(d3.scaleOrdinal())
  .yScale(d3.scaleLinear())
  .xAxisPosition("bottom")
  .yAxisPosition("left")
  .yAxisOffset(0.03)
  .colorScale(
    d3.scaleOrdinal()
    .range(["black", "green", "blue", "orange"])
  );
```
5. Always start with the `init()` method to set all the D3 js scales, formatting, etc.
```Javascript
slopeChart.init();
slopeChart.addSeries();
slopeChart.addXAxis();
slopeChart.addLabels();
```

### Example

Fetch a  csv data from a url of the book [Data Wrangling with JavaScript](https://github.com/Data-Wrangling-with-JavaScript) of the climate in New York City.

The dataset needs to be passed to a ETL process to be visualized.

To transform the dataset use the [Data Forge](https://www.npmjs.com/package/data-forge) library to calculate the average temperature and snowfall data and group per year. A sample of the dataset grouped:

| year | Average temperature | Average snowfall |
| ---- | ------------------- | ---------------- |
| 1917 | 10.55               | 3.4              |
| 1918 | 11.83               | 1.42             |
| 1919 | 12.13               | 0.87             |
| 1920 | 11.29               | 2.01             |

#### HTML code

```HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./test.css" type="text/css" />
    <script
      src="https://unpkg.com/d3@7.9.0/dist/d3.min.js"
      type="text/javascript"
      language="javascript"
    ></script>
    <script
      src="https://cdn.jsdelivr.net/npm/data-forge@1.8.12/dist/web/index.js"
      type="text/javascript"
      language="javascript"
    ></script>
    <title>Chart common chart js</title>
  </head>
  <body>
    <h1>Prueba</h1>
    <svg class="chart"></svg>
    <script src="test.js" type="module" language="javascript"></script>
  </body>
</html>
```

#### JavaScript code

```JavaScript
import {
  MultiLineChart
} from "./src/index.mjs";

const response = await fetch(
  [
    "https://raw.githubusercontent.com",
    "Data-Wrangling-with-JavaScript",
    "Chapter-9",
    "master",
    "data",
    "nyc-weather.csv",
  ].join("/")
);
const csvText = await response.text();

// Transdorm the data to a dataframe using the Data Forge library
const newYorkClimate = dataForge
  .fromCSV(csvText, {
    dynamicTyping: true
  })
  .select((row) => ({
    ...row,
    date: new Date(row.Year, row.Month - 1, row.Day),
    temperature: (row.MaxTemp + row.MinTemp) / 2,
  }))
  .dropSeries(["Day", "MaxTemp", "MinTemp", "Year", "Month"])
  .groupBy((row) => row.date.getFullYear())
  .select((group) => ({
    year: group.first().date.getFullYear(),
    "Average temperature": +group
      .deflate((record) => record.temperature)
      .average()
      .toFixed(2),
    "Average snowfall": +group
      .deflate((record) => record.Snowfall)
      .average()
      .toFixed(2),
  }))
  .inflate();

// Function to set the postfix units in the y axis
const customUnits = d3.formatLocale({
  currency: ["", "°C"],
});

const svgElem = document.querySelector("svg");
const width = svgElem.clientWidth;
const height = svgElem.clientHeight;

// Set all the parameters for the chart creation
const chart = new MultiLineChart()
  .bindTo("svg")
  .width(width)
  .height(height)
  .margin({
    top: 30,
    right: 50,
    bottom: 30,
    left: 50,
  })
  .data(newYorkClimate.toArray())
  .xSerie((d) => d.year)
  .ySeries((d) => ({
    temperature: d["Average temperature"],
    snowfall: d["Average snowfall"],
  }))
  .xScale(d3.scaleLinear())
  .yScale(d3.scaleLinear().nice())
  .xAxisPosition("bottom")
  .yAxisPosition("left")
  .yAxisOffset(0.05)
  .xAxisCustomizations({
    tickFormat: d3.format(".0f")
  })
  .yAxisCustomizations({
    tickFormat: customUnits.format("$.1f")
  })
  .colorScale(d3.scaleOrdinal().range(["black", "green", "blue"]))
  .radius(4);

// Add each part of the chart necessary
chart.init();
chart.addSeries();
chart.addXAxis();
chart.addYAxis();
chart.addLegend();
```

# Limitations

Neither the *common-chart-js* and *D3 js* are libraries for complex data cleaning. Thera another JavaScript libraries for data wrangling such as [Data Forge](https://www.npmjs.com/package/data-forge) or [Polars for JavaScript](https://www.npmjs.com/package/nodejs-polars).

 This library requires the **cleaned semi structured data** previously processed as a JSON file.

The user must have some previous knowledge about how to use **D3 js** in order to select the correct *scales* and *axis* to build the chart.

The **common-chart-js** code works only in **D3 js version 4** or above.

# Contributing
Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change. I invite you to collaborate directly in this repository: [common-charts-js](https://github.com/MetalbolicX/common-charts-js)

# License
common-charts-js is released under the [MIT License](https://opensource.org/licenses/MIT).