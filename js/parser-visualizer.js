//*************************** Parsing CSV File **************************//

/**
 * parse the csv file into a JSON Object
 * listners to the click event and Visualize
 */
$(function () {
  var csvData = {};
  var map = visMap();
  var markerList = [];
  var days = [
    "Sun.",
    "Mon.",
    "Tues.",
    "Wed.",
    "Thur.",
    "Fri.",
    "Sat."
  ];
  var times = [
    "12p",
    "1a",
    "2a",
    "3a",
    "4a",
    "5a",
    "6a",
    "7a",
    "8a",
    "9a",
    "10a",
    "11a",
    "12a",
    "1p",
    "2p",
    "3p",
    "4p",
    "5p",
    "6p",
    "7p",
    "8p",
    "9p",
    "10p",
    "11p",
    "12p"
  ];
  Papa.parse("./Sample1.csv", {
    delimiter: ",", // auto-detect
    newline: "", // auto-detect
    header: true,
    dynamicTyping: true,
    preview: 0,
    encoding: "",
    worker: false,
    comments: false,
    step: undefined,
    complete: function (results) {
      //console.log(results);
      csvData = results.data;
      $("#customer-submit").click(function (evt) {
        evt.preventDefault();
        var customerId = parseInt($("#customer-box").val());
        $("#customer-label").text($("#customer-box").val());
        $("#branch-label").text("");
        $("#customer-box").val("");
        customer = getCustomer(customerId, csvData);
        var visDataCustomer = visCustomer(customer, map, markerList);
        var dataVisCustomerHistory = customerHsitory(customerId, csvData);

        //HeatMap
        $("#heatmap").highcharts({
          chart: {
            type: "heatmap",
            marginTop: 40,
            marginBottom: 40,
            marginRight: 60,
            plotBorderWidth: 1,
            width: 300,
            height: 450
          },
          title: {
            text: "Customer Visit History"
          },

          xAxis: {
            categories: days
          },

          yAxis: {
            categories: times
            title: null
          },

          colorAxis: {
            min: 0,
            minColor: "#FFFFFF",
            maxColor: Highcharts.getOptions().colors[0]
          },

          legend: {
            align: "right",
            layout: "vertical",
            margin: 0,
            verticalAlign: "top",
            symbolHeight: 280,
            x: 10,
            y: 70
          },

          tooltip: {
            formatter: function () {
              return (
                "<b> On </b>" +
                "<b>" +
                this.series.xAxis.categories[this.point.x] +
                "<br />" +
                this.point.value +
                "</b> visits on <br><b>" +
                this.series.yAxis.categories[this.point.y] +
                "</b>"
              );
            }
          },

          series: [{
            name: "Customer Visit",
            borderWidth: 1,
            data: dataVisCustomerHistory[0],
            dataLabels: {
              enabled: false,
              color: "#000000"
            }
          }]
        });

        //Column chart
        var valuesVisitsDay = Object.keys(dataVisCustomerHistory[1]).map(
          function (key) {
            return dataVisCustomerHistory[1][key];
          }
        );
        $("#column-chart").highcharts({
          chart: {
            type: "column"
          },
          title: {
            text: ""
          },
          xAxis: {
            categories: days

            crosshair: true
          },
          yAxis: {
            min: 0,
            title: {
              text: null
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: "</table>",
            shared: true,
            useHTML: true
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0
            }
          },
          series: [{
            name: "Customer " + customerId,
            data: valuesVisitsDay
          }]
        });

        //Bar chart
        var valuesVisitsHour = Object.keys(dataVisCustomerHistory[4]).map(
          function (key) {
            return dataVisCustomerHistory[4][key];
          }
        );

        console.log(valuesVisitsHour);
        $("#right_col").highcharts({
          chart: {
            type: "bar",
            marginTop: 40,
            marginBottom: 40
          },
          title: {
            text: null
          },
          subtitle: {
            text: null
          },
          xAxis: {
            opposite: true,
            reversed: false,
            categories: times,
            title: {
              text: null
            }
          },
          yAxis: {
            opposite: true,
            reversed: true,
            min: 0,
            title: {
              text: null,
              align: "high"
            },
            labels: {
              overflow: "justify"
            }
          },
          tooltip: {
            valueSuffix: null
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: false
              }
            }
          },

          credits: {
            enabled: false
          },
          series: [{
            name: customerId,
            showInLegend: false,
            data: valuesVisitsHour
          }]
        });

        //Table
        //Build an array containing branch visits.
        var customerTable = new Array();
        customerTable.push(["Branch", "Number of Visits"]);

        for (el in dataVisCustomerHistory[2]) {
          customerTable.push([el, dataVisCustomerHistory[2][el]]);
        }
        //Create a HTML Table element.
        var table = document.createElement("TABLE");
        table.border = "1";

        //Get the count of columns.
        var columnCount = customerTable[0].length;

        //Add the header row.
        var row = table.insertRow(-1);
        for (var i = 0; i < columnCount; i++) {
          var headerCell = document.createElement("TH");
          headerCell.innerHTML = customerTable[0][i];
          row.appendChild(headerCell);
        }

        //Add the data rows.
        for (var i = 1; i < customerTable.length; i++) {
          row = table.insertRow(-1);
          for (var j = 0; j < columnCount; j++) {
            var cell = row.insertCell(-1);
            cell.innerHTML = customerTable[i][j];
          }
        }
        var dvTable = document.getElementById("dvTable");
        dvTable.innerHTML = "";
        dvTable.appendChild(table);

        $("#totalVisits").html(
          "Total Number of Visits: " + dataVisCustomerHistory[3]
        );
      });

      $("#branch-submit").click(function (evt) {
        evt.preventDefault();
        var branchId = parseInt($("#branch-box").val());
        $("#branch-label").text($("#branch-box").val());
        $("#customer-label").text("");
        $("#branch-box").val("");
        var branch = getBranch(branchId, csvData);
        var visDataBranch = visBranch(branch, map, markerList);
        var dataVisBranchHistory = branchHsitory(branchId, csvData);
        //console.log(branch);
        console.log(dataVisBranchHistory);
        //HeatMap
        $("#heatmap").highcharts({
          chart: {
            type: "heatmap",
            marginTop: 40,
            marginBottom: 40,
            marginRight: 60,
            plotBorderWidth: 1,
            width: 300,
            height: 450
          },
          title: {
            text: "Branch Visit History"
          },
          xAxis: {
            categories: days
          },

          yAxis: {
            categories: times,
            title: null
          },

          colorAxis: {
            min: 0,
            minColor: "#FFFFFF",
            maxColor: Highcharts.getOptions().colors[0]
          },

          legend: {
            align: "right",
            layout: "vertical",
            margin: 0,
            verticalAlign: "top",
            symbolHeight: 280,
            x: 10,
            y: 70
          },

          tooltip: {
            formatter: function () {
              return (
                "<b> On </b>" +
                "<b>" +
                this.series.xAxis.categories[this.point.x] +
                "<br />" +
                this.point.value +
                "</b> visits on <br><b>" +
                this.series.yAxis.categories[this.point.y] +
                "</b>"
              );
            }
          },
          series: [{
            name: "Branch Visit",
            borderWidth: 1,
            data: dataVisBranchHistory[0],
            dataLabels: {
              enabled: false,
              color: "#000000"
            }
          }]
        });

        //Column chart
        var valuesVisitsDay = Object.keys(dataVisBranchHistory[1]).map(function (
          key
        ) {
          return dataVisBranchHistory[1][key];
        });

        $("#column-chart").highcharts({
          chart: {
            type: "column"
          },
          title: {
            text: ""
          },
          xAxis: {
            categories: days,

            crosshair: true
          },
          yAxis: {
            min: 0,
            title: {
              text: null
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: "</table>",
            shared: true,
            useHTML: true
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0
            }
          },
          series: [{
            name: "Branch " + branchId,
            data: valuesVisitsDay
          }]
        });

        //Bar chart
        var valuesVisitsHour = Object.keys(dataVisBranchHistory[4]).map(
          function (key) {
            return dataVisBranchHistory[4][key];
          }
        );

        console.log(valuesVisitsHour);
        $("#right_col").highcharts({
          chart: {
            type: "bar",
            marginTop: 40,
            marginBottom: 40
          },
          title: {
            text: null
          },
          subtitle: {
            text: null
          },
          xAxis: {
            opposite: true,
            reversed: false,
            categories: times,
            title: {
              text: null
            }
          },
          yAxis: {
            opposite: true,
            reversed: true,
            min: 0,
            title: {
              text: null,
              align: "high"
            },
            labels: {
              overflow: "justify"
            }
          },
          tooltip: {
            valueSuffix: null
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: false
              }
            }
          },
          credits: {
            enabled: false
          },
          series: [{
            name: branchId,
            showInLegend: false,
            data: valuesVisitsHour
          }]
        });

        //Table
        //Build an array containing branch visits.
        var branchTable = new Array();
        branchTable.push(["Customer", "Number of Visits"]);

        for (el in dataVisBranchHistory[2]) {
          branchTable.push([el, dataVisBranchHistory[2][el]]);
        }
        //Create a HTML Table element.
        var table = document.createElement("TABLE");
        table.border = "1";
        //Get the count of columns.
        var columnCount = branchTable[0].length;
        //Add the header row.
        var row = table.insertRow(-1);
        for (var i = 0; i < columnCount; i++) {
          var headerCell = document.createElement("TH");
          headerCell.innerHTML = branchTable[0][i];
          row.appendChild(headerCell);
        }
        //Add the data rows.
        for (var i = 1; i < branchTable.length; i++) {
          row = table.insertRow(-1);
          for (var j = 0; j < columnCount; j++) {
            var cell = row.insertCell(-1);
            cell.innerHTML = branchTable[i][j];
          }
        }
        var dvTable = document.getElementById("dvTable");
        dvTable.innerHTML = "";
        dvTable.appendChild(table);
        $("#totalVisits").html(
          "Total Number of Visits: " + dataVisBranchHistory[3]
        );
      });
    },
    error: undefined,
    download: true,
    skipEmptyLines: false,
    chunk: undefined,
    fastMode: undefined,
    beforeFirstChunk: undefined,
    withCredentials: undefined
  });
});

/**
 * Create the map
 *
 */

var visMap = function () {
  var map = L.map("mapid").setView([41.0082, 28.9784], 8);
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/hespk/ciqnh5ctv0007sbnp19mrtaec/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVzcGsiLCJhIjoiY2lxbXphaDhtMDB6OGZwbm44ODZiN3ZxZiJ9.Ik94chI0325GS3pGGvZQsg", {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: "your.mapbox.project.id",
      accessToken: "your.mapbox.public.access.token"
    }
  ).addTo(map);
  var sidebar = L.control.sidebar("sidebar", {
    position: "left"
  });
  map.addControl(sidebar);
  return map;
};

// Icons to be used in the map
var branchIcon = L.icon({
  iconUrl: "bank-icon.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

var homeIcon = L.icon({
  iconUrl: "home-icon.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

var workIcon = L.icon({
  iconUrl: "briefcase-icon.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});