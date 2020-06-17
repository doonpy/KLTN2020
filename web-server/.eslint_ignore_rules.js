module.exports = [
    // {
    //     rules: {
    //         '@typescript-eslint/explicit-module-boundary-types': 'off',
    //     }, //Turn off typescript for Javascript React
    //     files: ['./web-server/**/*'],
    // },
    {
        rules: { 'default-param-last': 'off' },
        files: ['web-server/store/map-key/reducers.js'],
    },
    {
        rules: { 'node/no-unpublished-require': 'off' },
        files: [
            'web-server/store/store.js',
            'web-server/next.config.js',
            'tailwind.config.js',
        ],
    },
    {
        rules: { 'node/no-unpublished-import': 'off' },
        files: ['web-server/store/store.js'],
    },
    {
        rules: { 'consistent-return': 'off' },
        files: ['web-server/hooks/use-event-listener.js'],
    },
    {
        rules: { 'react/display-name': 'off' },
        files: ['web-server/components/page-map.js'],
    },
    {
        rules: { 'react/prop-types': 'off' },
        files: [
            'web-server/components/MenuItemHeader.js',
            'web-server/components/ChartWrapper/TotalByDistrictBarChart.js',
            'web-server/components/ChartWrapper/TypePropertyPieChart.js',
            'web-server/components/TypeTransactionBox.js',
            'web-server/components/charts/BarChart.js',
            'web-server/components/charts/PieChart.js',
            'web-server/components/TypeTransactionBox.js',
            'web-server/components/maps/MapOverview.js',
            'web-server/components/page-map.js',
            'web-server/components/page-right.js',
            'web-server/components/page-map.js',
            'web-server/components/page-right.js',
            'web-server/components/maps/MapWard.js',
            'web-server/components/MenuItemHeader.js',
            'web-server/pages/detail/[id].js',
            'web-server/pages/detail/[id].js',
            'web-server/components/page-right.js',
            'web-server/components/maps/MapOverview.js',
            'web-server/components/charts/BarChart.js',
            'web-server/components/page-map.js',
            'web-server/pages/index.js',
            'web-server/components/page-map.js',
            'web-server/components/page-right.js',
            'web-server/pages/_app.js',
            'web-server/components/maps/MapItem.js',
            'web-server/components/maps/MapLeaf.js',
            'web-server/components/maps/MapOverview.js',
            'web-server/components/maps/MapWard.js',
            'web-server/components/page-left.js',
            'web-server/components/page-right.js',
            'web-server/components/maps/MapLeaf.js',
            'web-server/components/page-left.js',
            'web-server/components/page-map.js',
            'web-server/components/page-right.js',
            'web-server/components/maps/MapLeaf.js',
            'web-server/components/page-map.js',
            'web-server/components/page-right.js',
        ],
    },
    {
        rules: { 'new-cap': 'off' },
        files: [
            'api-server/src/common/service/common.service.controller.base.ts',
        ],
    },
    {
        rules: { 'max-params': 'off' },
        files: [
            'api-server/src/background-job/scrape/raw-data/scrape.raw-data.ts',
        ],
    },
    {
        rules: { 'max-depth': 'off' },
        files: ['api-server/src/middleware/error-handler/error-handler.ts'],
    },
];
