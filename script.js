$(document).ready(function () {

    var myChart; 
    var parsedData;
    var labels;

    // Fetch CSV data and update chart
    async function fetchAndInitChart() {
        const url = 'http://127.0.0.1:5500/data.csv';
        const response = await fetch(url);
        const tabledata = await response.text();

        parsedData = Papa.parse(tabledata, { header: true }).data;

        const labels = parsedData.map(row => row.Date);
        const closeData = parsedData.map(row => row.Close);
        const minData = parsedData.map(row => row.Min);
        const aveData = parsedData.map(row => row.Ave);
        const maxData = parsedData.map(row => row.Max);

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
                        enabled: false
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
            const [day, month, year] = row.Date ? row.Date.split('/') : ['', '', ''];
            const rowDate = new Date(year, month - 1, day);
            return rowDate >= pastDate && rowDate <= today;
        });
        return filteredData;
    }
    

// Function to update the chart with new data
function updateChart(data) {
    labels = data.map(row => row.Date);
    myChart.data.labels = data.map(row => row.Date);
    myChart.data.datasets[0].data = data.map(row => row.Close);
    myChart.data.datasets[1].data = data.map(row => row.Min);
    myChart.data.datasets[2].data = data.map(row => row.Ave);
    myChart.data.datasets[3].data = data.map(row => row.Max);

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

});
