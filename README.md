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
chart.addTitle({
  title: "New York city climate",
  widthOffset: 0.5,
  heightOffset: 0.1,
});
chart.xAxisName({ title: "Years", widthOffset: 0.5, deltaY: 30 });
chart.yAxisName({ title: "Temperature", heightOffset: 0.5, deltaY: 18})
chart.addCriticalPoints(customUnits.format("$.1f"));
```
#### Chart

<svg class="chart"><g class="series"><g class="temperature"><path class="temperature serie" d="M50,207.13L57,161.502L64,150.808L71,180.752L78,128.707L85,155.442L92,167.206L99,187.881L106,157.581L113,199.288L120,157.937L127,156.868L134,143.679L141,136.549L148,110.17L155,123.36L162,139.401L169,165.067L176,164.71L183,157.581L190,135.836L197,121.934L204,132.984L211,189.307L218,127.637L225,144.392L232,151.164L239,132.628L246,144.392L253,118.369L260,149.739L267,144.035L274,88.426L281,152.59L288,126.212L295,111.24L302,85.93L309,129.063L316,131.202L323,156.868L330,116.943L337,174.335L344,117.656L351,147.243L358,125.499L365,156.868L372,153.66L379,135.48L386,141.896L393,125.142L400,165.78L407,145.461L414,130.489L421,140.47L428,121.934L435,149.382L442,104.467L449,131.915L456,127.281L463,160.433L470,139.044L477,165.78L484,110.883L491,127.637L498,123.003L505,128.707L512,106.962L519,118.726L526,115.874L533,120.508L540,123.36L547,131.559L554,147.243L561,82.366L568,82.366L575,148.313L582,115.874L589,121.577L596,119.439L603,152.59L610,140.827L617,83.791L624,96.981L631,150.808L638,101.971L645,98.407L652,157.224L659,136.906L666,111.953L673,89.851L680,124.073L687,120.152L694,145.817L701,91.99L708,97.694L715,80.94L722,118.726L729,137.262L736,90.921L743,83.435L750,56.343" style="stroke: black; fill: none;"></path></g><g class="snowfall"><path class="snowfall serie" d="M50,462.007L57,532.588L64,552.194L71,483.039L78,523.32L85,510.131L92,452.026L99,516.547L106,507.279L113,477.335L120,551.838L127,547.204L134,537.935L141,550.768L148,563.245L155,551.838L162,500.506L169,490.168L176,478.761L183,515.834L190,548.273L197,513.339L204,518.686L211,514.052L218,498.367L225,534.727L232,531.162L239,507.635L246,484.465L253,549.699L260,435.628L267,422.795L274,537.222L281,543.283L288,561.463L295,518.33L302,563.958L309,548.986L316,546.134L323,508.348L330,509.061L337,484.465L344,519.755L351,480.187L358,474.484L365,545.778L372,526.172L379,493.02L386,530.45L393,507.635L400,456.304L407,539.005L414,508.705L421,530.45L428,550.768L435,526.528L442,569.305L449,531.162L456,545.421L463,533.301L470,533.658L477,452.026L484,508.348L491,553.264L498,536.866L505,519.755L512,519.042L519,510.487L526,534.727L533,551.838L540,517.973L547,544.352L554,548.63L561,547.204L568,537.579L575,552.907L582,506.21L589,467.711L596,517.973L603,431.707L610,558.611L617,564.671L624,556.472L631,509.774L638,529.38L645,547.204L652,439.193L659,519.042L666,464.859L673,507.992L680,545.065L687,546.134L694,499.08L701,436.698L708,472.345L715,559.68L722,509.418L729,459.155L736,461.294L743,494.09L750,508.705" style="stroke: green; fill: none;"></path></g></g><g class="x axis" transform="translate(0, 570)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle"><path class="domain" stroke="currentColor" d="M50.5,6V0.5H750.5V6"></path><g class="tick" opacity="1" transform="translate(71.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1920</text></g><g class="tick" opacity="1" transform="translate(141.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1930</text></g><g class="tick" opacity="1" transform="translate(211.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1940</text></g><g class="tick" opacity="1" transform="translate(281.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1950</text></g><g class="tick" opacity="1" transform="translate(351.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1960</text></g><g class="tick" opacity="1" transform="translate(421.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1970</text></g><g class="tick" opacity="1" transform="translate(491.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1980</text></g><g class="tick" opacity="1" transform="translate(561.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">1990</text></g><g class="tick" opacity="1" transform="translate(631.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">2000</text></g><g class="tick" opacity="1" transform="translate(701.5,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">2010</text></g></g><g class="y axis" transform="translate(50, 0)" fill="none" font-size="10" font-family="sans-serif" text-anchor="end"><path class="domain" stroke="currentColor" d="M-6,570.5H0.5V30.5H-6"></path><g class="tick" opacity="1" transform="translate(0,512.4130606990791)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">2.0°C</text></g><g class="tick" opacity="1" transform="translate(0,441.11887315575797)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">4.0°C</text></g><g class="tick" opacity="1" transform="translate(0,369.82468561243695)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">6.0°C</text></g><g class="tick" opacity="1" transform="translate(0,298.53049806911577)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">8.0°C</text></g><g class="tick" opacity="1" transform="translate(0,227.23631052579464)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">10.0°C</text></g><g class="tick" opacity="1" transform="translate(0,155.9421229824735)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">12.0°C</text></g><g class="tick" opacity="1" transform="translate(0,84.64793543915239)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">14.0°C</text></g></g><g class="legends" transform="translate(680, 30)"><rect class="temperature legend" width="5" height="5" y="0" style="fill: black;"></rect><rect class="snowfall legend" width="5" height="5" y="10" style="fill: green;"></rect><text class="temperature legend-name" x="10" y="0" dy="5" style="fill: black;">temperature</text><text class="snowfall legend-name" x="10" y="10" dy="5" style="fill: green;">snowfall</text></g><g class="chart-title"><text x="400" y="60" style="text-anchor: middle;">New York city climate</text></g><g class="axes-name"><text class="x axis-name" x="400" y="570" dy="30">Years</text><text class="y axis-name" transform="rotate(-90)" x="-300" y="50" dy="18">Temperature</text></g><g class="critical-points"><text class="temperature max" x="750" y="56.343202297257186" style="text-anchor: middle;">14.8°C</text><text class="temperature min" x="50" y="207.1304089513813" style="text-anchor: middle;">10.6°C</text><text class="snowfall max" x="267" y="422.7953262699277" style="text-anchor: middle;">4.5°C</text><text class="snowfall min" x="442.00000000000006" y="569.3048816714526" style="text-anchor: middle;">0.4°C</text></g></svg>

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