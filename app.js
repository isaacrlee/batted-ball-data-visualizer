var GRAY = '#AAAAAA';
var NAVY = '#001f3f';
var BLUE = '#0074D9';
var GREEN = '#2ECC40';
var YELLOW = '#FFDC00';
var ORANGE = '#FF851B';
var RED = '#FF4136';
var MAROON = '#85144b';

var scatterPlot = document.getElementById('scatter-plot');
var polarPlot = document.getElementById('polar-plot');

var scatterLayout = {
    xaxis: {
        fixedrange: true,
        hoverformat: '.1f',
        range: [0, 120],
        title: 'Exit Speed (mph)',
        zeroline: true
    },
    yaxis: {
        fixedrange: true,
        hoverformat: '.1f',
        range: [-90, 90],
        zeroline: true,
        title: 'Launch Angle (deg)',
    },
    title: 'Exit Speed vs Launch Angle',
    hoverinfo: 'name'
}

var scatterConfig = {
    displayModeBar: false,
    responsive: true
}

var scatterFig = {
    data: [[]],
    layout: scatterLayout,
    config: scatterConfig
}

var polarLayout = {
    title: 'Exit Direction vs Hit Distance',
    polar: {
        sector: [45, 135],
        domain: {
            x: [0, 1],
            y: [0, 1]
        },
        radialaxis: {
            fixedrange: true,
            hoverformat: '.1f',
            range: [0, 500],
            title: 'Hit Distance (feet)'
        },
        angularaxis: {
            hoverformat: '.1f',
            direction: "clockwise"
        }
    }
}

var polarConfig = {
    displayModeBar: false,
    responsive: true
}

var polarFig = {
    data: [[]],
    layout: polarLayout,
    config: polarConfig
}

Plotly.newPlot('scatter-plot', scatterFig);
Plotly.newPlot('polar-plot', polarFig);


var updatePlots = function (results) {
    // ExitSpeedLaunchAngle Scatter Plot

    Plotly.deleteTraces('scatter-plot', _.range(scatterPlot.data.length))
    Plotly.addTraces('scatter-plot', createScatterTraces(results));

    // ExitDirectionHitDistance Polar Plot

    Plotly.deleteTraces('polar-plot', _.range(polarPlot.data.length))
    Plotly.addTraces('polar-plot', createPolarTraces(results))

    scatterPlot.on('plotly_click', function (data) {
        window.open(data.points[0].text);
    })

    polarPlot.on('plotly_click', function (data) {
        window.open(data.points[0].text);
    })
}

function createScatterTraces(results) {
    var traces = [];
    var outcomes = _.groupBy(results.hits, function(h){return h.PLAY_OUTCOME});
    var colors = {
        'Undefined': GRAY,
        'Out': NAVY,
        'FieldersChoice': BLUE,
        'Sacrifice': GREEN,
        'Single': YELLOW,
        'Double': ORANGE,
        'Triple': RED,
        'HomeRun': MAROON
    };
    for (var outcome in outcomes) {
        traces.push(
            {
                x: _.map(outcomes[outcome], 'EXIT_SPEED'),
                y: _.map(outcomes[outcome], 'LAUNCH_ANGLE'),
                text: _.map(outcome, 'VIDEO_LINK'),
                mode: 'markers',
                marker: {
                    color: colors[outcome]
                },
                name: outcome,
                hoverinfo: "x+y",
                type: 'scatter'
            }
        );
    }
    return traces;
}

function createPolarTraces(results) {
    var traces = [];
    var outcomes = _.groupBy(results.hits, function(h){return h.PLAY_OUTCOME});
    var colors = {
        'Undefined': GRAY,
        'Out': NAVY,
        'FieldersChoice': BLUE,
        'Sacrifice': GREEN,
        'Single': YELLOW,
        'Double': ORANGE,
        'Triple': RED,
        'HomeRun': MAROON
    };
    for (var outcome in outcomes) {
        traces.push(
            {
                r: _.map(outcomes[outcome], 'HIT_DISTANCE'),
                theta: _.map(outcomes[outcome], 'EXIT_DIRECTION'),
                text: _.map(outcomes[outcome], 'VIDEO_LINK'),
                mode: 'markers',
                marker: {
                    color: colors[outcome]
                },
                name: outcome,
                hoverinfo: "r+theta",
                type: 'scatterpolar'
            }
        );
    }
    return traces;
}


// SEARCH

var batter = '';
var pitcher = '';

var client = algoliasearch('FXI57GZTUI', '526a4043d587ee892500554ce05d7bb5');
var playsIndex = client.initIndex('plays');
var battersIndex = client.initIndex('batters');
var pitchersIndex = client.initIndex('pitchers');

var batterSearch = autocomplete('#batter-aa-search-input', { autoselect: true, hint: true, minLength: 3, debug: true}, [
    {
        source: function (query, callback) {
            playsIndex.searchForFacetValues({
                facetName: 'BATTER',
                facetQuery: query
            }).then(function (answer) {
                callback(answer.facetHits);
            }).catch(function () {
                callback([]);
            })
        },
        displayKey: 'name',
        templates: {
            suggestion: function (suggestion) {
                return '<span>' + suggestion.highlighted + '</span>';
            }
        }
    }
])

batterSearch.on('autocomplete:selected', function (event, suggestion, dataset) {
    batter = suggestion.value;
    batterSearch.autocomplete.setVal(batter);
    playsIndex.search({
        filters: pitcher ? `BATTER:"${batter}" AND PITCHER:"${pitcher}"` : `BATTER:"${batter}"`
    }, function (err, content) {
        updatePlots(content);
    });
});

var pitcherSearch = autocomplete('#pitcher-aa-search-input', { autoselect: true, hint: true, minLength: 3, debug: true}, [
    {
        source: function (query, callback) {
            playsIndex.searchForFacetValues({
                facetName: 'PITCHER',
                facetQuery: query
            }).then(function (answer) {
                callback(answer.facetHits);
            }).catch(function () {
                callback([]);
            })
        },
        displayKey: 'name',
        templates: {
            suggestion: function (suggestion) {
                return '<span>' + suggestion.highlighted + '</span>';
            }
        }
    }
])
pitcherSearch.on('autocomplete:selected', function (event, suggestion, dataset) {
    pitcher = suggestion.value;
    pitcherSearch.autocomplete.setVal(pitcher);
    playsIndex.search({
        filters: batter ? `BATTER:"${batter}" AND PITCHER:"${pitcher}"` : `PITCHER:"${pitcher}"`
    }, function (err, content) {
        updatePlots(content);
    });
})

document.getElementById('batter-aa-search-input').addEventListener("click", function() {
    batter = '';
    batterSearch.autocomplete.setVal(batter);
    if(!(batter === '') || !(pitcher === '')) {
        playsIndex.search({
            filters: batter ? `BATTER:"${batter}" AND PITCHER:"${pitcher}"` : `PITCHER:"${pitcher}"`
        }, function (err, content) {
            updatePlots(content);
        });
    }
})

document.getElementById('pitcher-aa-search-input').addEventListener("click", function() {
    pitcher = '';
    pitcherSearch.autocomplete.setVal(pitcher);
    if(!(batter === '') || !(pitcher === '')) {
        playsIndex.search({
            filters: pitcher ? `BATTER:"${batter}" AND PITCHER:"${pitcher}"` : `BATTER:"${batter}"`
        }, function (err, content) {
            updatePlots(content);
        });
    }
})
;