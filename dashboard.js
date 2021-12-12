window.addEventListener("load", start);

let dataItems;
let barChart;

async function start(event) {
  const ctx = document.getElementById('canvas-scatter').getContext('2d');
  const fetchPromise = fetch("world-happiness-report-2021.csv");
  let response = await fetchPromise.then(response => {
    return response.text();
  });
  dataItems = convertToValidFormat(csvToArray(response));
  const data = {
    datasets: [{
      label: "World Happiness Report", 
      data: dataItems.map(val =>  ({ x: (val.socialSupport + val.perceivedCorruption) / 2, y: val.lifeLadder})), //{x: dataItems.map(val => (val.socialSupport + val.perceivedCorruption) / 2), y: dataItems.map(val => val.lifeLadder)},
      backgroundColor: 'rgb(255, 99, 132)',
    }]
  }
  console.log(data);
  const scatterplot = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: {
      responsive: false,
      scales: {
        y: {
          title: {
            text: "life ladder",
            display: "true"
          }
        },
        x: {
          title: {
            text: "Social support + (1 - Corruption)",
            display: "true"
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(item) {
              updateBarChart(dataItems[item.dataIndex]);
              return dataItems[item.dataIndex].name + ": " + item.label + ", " +  item.formattedValue;
            },
          }
        }
      }
    }
  });
}

function updateBarChart(item) {
  if (barChart)
    barChart.destroy();
  const data = {
    labels: ["life ladder", "social support", "perceived corruption"],
    datasets: [{
      label: item.name,
      data: [item.lifeLadder / 10, item.socialSupport, item.perceivedCorruption],
      backgroundColor: ['rgb(239, 138, 98)', 'rgb(247, 247, 247)', 'rgb(103, 169, 207)']
    }]
  }
  const ctx = document.getElementById('canvas-bar').getContext('2d');
  barChart = new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      responsive: false
    }
  });
}

function csvToArray(str, delimiter = /[,\r]+/) {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

function convertToValidFormat(input) {
  let dataItems = [];

  let socialSupport;
  let perceivedCorruption;
  let lifeLadder;
  for (let i = 0; i < input.length - 1; i++) {
    let country = input[i];
    socialSupport = parseFloat(country["Social support"]);
    perceivedCorruption = 1 - parseFloat(country["Perceptions of corruption"]);
    lifeLadder = parseFloat(country["Ladder score"]);
    dataItems.push({name: country["Country name"], socialSupport: socialSupport, perceivedCorruption: perceivedCorruption, lifeLadder: lifeLadder});
  }
  return dataItems;
} 
