export const CUSTOM_STYLE_HIGHMAPS = {
    credits: {
        enabled: false,
    },
    colorAxis: {
        min: 1,
        type: 'logarithmic',
        minColor: '#EEEEFF',
        maxColor: '#000022',
        stops: [
            [0, '#EFEFFF'],
            [0.67, '#4444FF'],
            [1, '#000022'],
        ],
    },
    mapNavigation: {
        enabled: true,
        buttonOptions: {
            verticalAlign: 'top',
        },
        style: {
            top: 12,
        },
    },
    plotOptions: {
        map: {
            states: {
                hover: {
                    borderColor: 'red',
                    borderWidth: 10,
                    brightness: 0,
                },
            },
            events: {
                click: (e) => {
                    return false;
                },
            },
        },
    },
    drilldown: {
        activeDataLabelStyle: {
            color: '#FFFFFF',
            textDecoration: 'none',
            textOutline: '1px #000000',
        },
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'right',
        backgroundColor: 'rgba(0,0,0,0)',
        style: {
            color: '#fff',
        },
        y: 35,
    },
};

export const CUSTOM_SERIES_HIGHMAPS = {
    dataLabels: {
        enabled: true,
        color: '#FFFFFF',
        format: '{point.name}',
    },
    allowPointSelect: true,
    cursor: 'pointer',
    showInLegend: false,
    tooltip: {
        useHTML: true,
        pointFormat: `<b>{point.name}</b>: {point.value:.1f} BĐS/km²`,
    },
};

export const getCustomHighmaps = (events) => {
    return {
        type: 'map',
        backgroundColor: '#ffffff',
        events,
    };
};
