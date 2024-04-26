$(document).ready(function () {

    var myChart; 
    var parsedData;
    var labels;

    // Variables to calculate min, max, and average dynamically
    var minFactor ;
    var maxFactor; 
    var aveFactor; 

    // Retrieve the last saved maxFactor and minFactor values from Local Storage
    var maxFactor = parseFloat(localStorage.getItem('maxFactor')) || 29.667; 
    var minFactor = parseFloat(localStorage.getItem('minFactor')) || 14.234;

    // Set the initial value of the maxFactor and minFactor input fields
    document.getElementById('maxFactorInput').value = maxFactor;
    document.getElementById('minFactorInput').value = minFactor;

    // Event listener to update factors when input values change
    document.getElementById('minFactorInput').addEventListener('change', function() {
        minFactor = parseFloat(this.value);
        // Update Local Storage with the new minFactor value
        localStorage.setItem('minFactor', minFactor);
        // Update the chart
        fetchAndInitChart();
    });

    document.getElementById('maxFactorInput').addEventListener('change', function() {
        maxFactor = parseFloat(this.value);
        // Update Local Storage with the new maxFactor value
        localStorage.setItem('maxFactor', maxFactor);
        // Update the chart
        fetchAndInitChart();
    });


    // Fetch CSV data and update chart
    async function fetchAndInitChart() {
        const url = 'http://127.0.0.1:5500/DNL_PER_Test.csv';
        const response = await fetch(url);
        const tabledata = await response.text();

        const harmonicMean = await calculateHarmonicMean();
        aveFactor = harmonicMean;
        console.log("ave:", aveFactor);

        parsedData = Papa.parse(tabledata, { header: true }).data;

        labels = parsedData.map(row => row.date);
        const closeData = parsedData.map(row => row.close);
      
        // Calculate min, max, and ave data dynamically 
        const minData = parsedData.map(row => row.ttm * minFactor); 
        const aveData = parsedData.map(row => row.ttm * aveFactor); 
        const maxData = parsedData.map(row => row.ttm * maxFactor);


        // Find the last value in the closeData array
        var lastTradedP = closeData[closeData.length - 2];
        var sellTarget= maxData[maxData.length -2]; 
        var tacticalTarget=aveData[aveData.length -2]; 
        var buyTarget= minData[minData.length -2];
        
        lastTradedP = parseFloat(lastTradedP);
        sellTarget = parseFloat(sellTarget);
        tacticalTarget = parseFloat(tacticalTarget);
        buyTarget = parseFloat(buyTarget);
                
        // Update the content of the table cell
         $("#lastTradedP").text(lastTradedP.toFixed(2));
         $("#sellTarget").text(sellTarget.toFixed(2));
         $("#tacticalTarget").text(tacticalTarget.toFixed(2));
         $("#buyTarget").text(buyTarget.toFixed(2));

         
        if (myChart) {
            myChart.destroy();
        }

        var ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, { 
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Close",
                        data: closeData,
                        borderColor: '#0000FF',
                        pointRadius: 0.1,
                    },
                    {
                        label: "Min",
                        data: minData,
                        borderColor: '#FF0000',
                        tension: 0.4,
                        stepped: 'middle',
                        pointRadius: 0.1
                    },
                    {
                        label: "Ave",
                        data: aveData,
                        borderColor: '#FF9D00',
                        tension: 0.4,
                        stepped: 'middle',
                        pointRadius: 0.1
                    },
                    {
                        label: "Max",
                        data: maxData,
                        borderColor: '#008000',
                        tension: 0.4,
                        stepped: 'middle',
                        pointRadius: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    intersect: false,
                    axis: 'x'
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                // Get the date string from the labels array using the index
                                var dateString = labels[index];
                            
                                // Check if dateString is not empty or undefined
                                if (dateString) {
                                    // Split the date string into day, month, and year components
                                    var dateParts = dateString.split('/');
                                    
                                    var day = parseInt(dateParts[0], 10);
                                    var month = parseInt(dateParts[1], 10);
                                    var year = parseInt(dateParts[2], 10);
                                    
                                    // Create a new Date object with the correct date components
                                    var date = new Date(year, month - 1, day); 
                                    // Format the date as MMM YYYY
                                    var monthLabel = date.toLocaleString('default', { month: 'short' });
                                    var formattedLabel = monthLabel + ' ' + year;
                                    return formattedLabel;
                                } else {
                                    // Handle the case where dateString is empty or undefined
                                    return '';
                                }
                            }
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false,
                            drawTicks: false,
                            drawBorder: false,
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });

        }

    fetchAndInitChart();

    // Event listener for dropdown menu items
$('#pastMonth, #past6Months, #pastYear, #past3Years, #past5Years, #allTime').click(function () {
    const timeRange = $(this).attr('id');
    // Filter data based on selected time range
    const filteredData = filterDataByTimeRange(parsedData, timeRange);

    updateChart(filteredData);
});

function updateChartWithNewFactors() {
    updateFactors();
    fetchAndInitChart();
}

function updateFactors() {
    minFactor = parseFloat(document.getElementById('minFactorInput').value);
    maxFactor = parseFloat(document.getElementById('maxFactorInput').value);
}

// Event listener to update factors when input values change
document.getElementById('minFactorInput').addEventListener('change', updateFactors);
document.getElementById('maxFactorInput').addEventListener('change', updateFactors);
// Event listener for the update button

// Function to toggle between edit and update modes
function toggleEditUpdateMode() {
    const maxInput = document.getElementById('maxFactorInput');
    const minInput = document.getElementById('minFactorInput');
    const editButton = document.getElementById('editButton');

    if (maxInput.disabled && minInput.disabled) {
        // Enable input fields
        maxInput.disabled = false;
        minInput.disabled = false;
        // Change button text to "Update"
        editButton.textContent = 'Update';
    } else {
        // Disable input fields
        maxInput.disabled = true;
        minInput.disabled = true;
        // Change button text to "Edit"
        editButton.textContent = 'Edit';
        // Update the chart with new factors
        updateChartWithNewFactors();
    }
}

// Event listener for the edit button
document.getElementById('editButton').addEventListener('click', toggleEditUpdateMode);


// Function to filter data based on selected time range
function filterDataByTimeRange(data, timeRange) {
        const today = new Date();
        let pastDate;
    
        switch (timeRange) {
            case 'pastMonth':
                pastDate = new Date(today.getFullYear(), today.getMonth() - 3, 1); 
                break;
            case 'past6Months':
                pastDate = new Date(today.getFullYear(), today.getMonth() - 6, 1); 
                break;
            case 'pastYear':
                pastDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                break;
            case 'past3Years':
                pastDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
                break;
            case 'past5Years':
                pastDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
                break;
            case 'allTime':
            default:
                return data;
        }
    
        const filteredData = data.filter(row => {
            const [day, month, year] = row.date ? row.date.split('/') : ['', '', ''];
            const rowDate = new Date(year, month - 1, day);
            return rowDate >= pastDate && rowDate <= today;
        });
        return filteredData;
    }
    

// Function to update the chart with new data
function updateChart(data) {
    labels = data.map(row => row.date);
    myChart.data.labels = labels; 
    myChart.data.datasets[0].data = data.map(row => row.close);
    myChart.data.datasets[1].data = data.map(row => row.ttm * minFactor); 
    myChart.data.datasets[2].data = data.map(row => row.ttm * aveFactor); 
    myChart.data.datasets[3].data = data.map(row => row.ttm * maxFactor);

    myChart.update();
}

async function initChartAndAttachEventListener() {
    await fetchAndInitChart(); 

    
    $('#myChart').mousemove(function(e){
        var activePoint = myChart.getElementsAtEventForMode(e, 'x', { intersect: true }, false)[0];
        if (activePoint) {
            var closeValue = myChart.data.datasets[0].data[activePoint.index];
            var minValue = myChart.data.datasets[1].data[activePoint.index];
            var aveValue = myChart.data.datasets[2].data[activePoint.index];
            var maxValue = myChart.data.datasets[3].data[activePoint.index];
            
            closeValue = parseFloat(closeValue);
            minValue = parseFloat(minValue);
            aveValue = parseFloat(aveValue);
            maxValue = parseFloat(maxValue);

            // Update stock prices
            $('#closeP .stock-price').text(closeValue.toFixed(2));
            $('#minP .stock-price').text(minValue.toFixed(2));
            $('#aveP .stock-price').text(aveValue.toFixed(2));
            $('#maxP .stock-price').text(maxValue.toFixed(2));
        }
    });
}

initChartAndAttachEventListener();

// JavaScript to update the dropdown button text when a menu item is clicked
document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        const selectedRange = this.textContent;
        document.getElementById('dropdownMenuButton').textContent = selectedRange;
    });
});

async function fetchPERValues() {
    const url = 'http://127.0.0.1:5500/DNL_PERvalues.csv';
    const response = await fetch(url);
    const perValuesData = await response.text();
    return perValuesData;
}

async function processData() {
    const perValuesData = await fetchPERValues();
    const parsedData = Papa.parse(perValuesData, { header: true }).data;

    // Map the parsed data to get an array of PER values
    const perValues = parsedData.map(row => parseFloat(row.PER));
    const numericPerValues = perValues.filter(value => !isNaN(value));

    // Calculate mean and standard deviation
    const mean = numericPerValues.reduce((acc, val) => acc + val, 0) / numericPerValues.length;
    const squaredDiffs = numericPerValues.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numericPerValues.length;
    const standardDeviation = Math.sqrt(variance);

    // Define the threshold for outliers (e.g., 2 standard deviations)
    const outlierThreshold = 2 * standardDeviation;

    // Filter out values beyond the threshold
    const filteredValues = numericPerValues.filter(val => Math.abs(val - mean) <= outlierThreshold);

    // Sort the filtered array to get the top 10 max and min values
    const sortedFilteredValues = filteredValues.slice().sort((a, b) => a - b);

    // Convert values to strings rounded to 3 decimal places and use a Set to ensure uniqueness
    const roundedMaxValuesSet = new Set(sortedFilteredValues.map(value => value.toFixed(3)));

    // Convert the Set back to an array
    const top10MaxValues = Array.from(roundedMaxValuesSet).slice(-15).reverse();

    // Do the same for min values
    const roundedMinValuesSet = new Set(sortedFilteredValues.map(value => value.toFixed(3)));
    const top10MinValues = Array.from(roundedMinValuesSet).slice(0, 15);

    // Populate the maximum and minimum values in the HTML table
    const maxMinTableBody = document.querySelector('.table-max-min');
    maxMinTableBody.innerHTML = '';
    for (let i = 0; i < Math.max(top10MaxValues.length, top10MinValues.length); i++) {
        const row = document.createElement('tr');
        const maxCell = document.createElement('td');
        maxCell.textContent = i < top10MaxValues.length ? top10MaxValues[i] : '';
        row.appendChild(maxCell);
        const minCell = document.createElement('td');
        minCell.textContent = i < top10MinValues.length ? top10MinValues[i] : '';
        row.appendChild(minCell);
        maxMinTableBody.appendChild(row);
    }
}


async function calculateHarmonicMean() {
    const perValuesData = await fetchPERValues();
    const parsedData = Papa.parse(perValuesData, { header: true }).data;

    // Map the parsed data to get an array of PER values
    const perValues = parsedData.map(row => parseFloat(row.PER));
    const numericPerValues = perValues.filter(value => !isNaN(value));

    // Calculate the harmonic mean
    const harmonicMean = numericPerValues.length / numericPerValues.reduce((acc, val) => acc + (1 / val), 0);

    return harmonicMean;
}

processData();


});
