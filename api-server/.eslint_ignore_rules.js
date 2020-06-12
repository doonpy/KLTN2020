module.exports = [
    {
        rules: { 'node/no-missing-import': 'off' },
        files: [
            'api-server/src/app.ts',
            'api-server/src/background-job/child-processes/clean-data/main.ts',
        ],
    },
    {
        rules: { 'no-process-exit': 'off' },
        files: [
            'api-server/src/data-initialization.ts',
            'api-server/src/background-job/child-processes/clean-data/main.ts',
            'api-server/src/background-job/child-processes/group-data/GroupData.ts',
            'api-server/src/background-job/child-processes/group-data/main.ts',
            'api-server/src/background-job/child-processes/preprocessing-data/main.ts',
            'api-server/src/background-job/child-processes/scrape-data/main.ts',
            'api-server/src/background-job/child-processes/scrape-data/raw-data/ScrapeRawData.ts',
        ],
    },
    {
        rules: { 'no-throw-literal': 'off' },
        files: [
            'api-server/src/service/CommonServiceLogicBase.ts',
            'api-server/src/util/checker/CheckerDate.ts',
            'api-server/src/util/checker/CheckerDecimalRange.ts',
            'api-server/src/util/checker/CheckerDomain.ts',
            'api-server/src/util/checker/CheckerIntegerRange.ts',
            'api-server/src/util/checker/CheckerLanguage.ts',
            'api-server/src/util/checker/CheckerMeasureUnit.ts',
            'api-server/src/util/checker/CheckerStringLength.ts',
            'api-server/src/util/checker/CheckerUrl.ts',
            'api-server/src/util/checker/type/CheckerTypeArray.ts',
            'api-server/src/util/checker/type/CheckerTypeBoolean.ts',
            'api-server/src/util/checker/type/CheckerTypeDecimal.ts',
            'api-server/src/util/checker/type/CheckerTypeInteger.ts',
            'api-server/src/util/checker/type/CheckerTypeObject.ts',
            'api-server/src/util/checker/type/CheckerTypeString.ts',
        ],
    },
    {
        rules: { 'max-params': 'off' },
        files: [
            'api-server/src/service/visual/map-point/helper.ts',
            'api-server/src/background-job/child-processes/scrape-data/raw-data/ScrapeRawData.ts',
        ],
    },
    {
        rules: { 'max-statements': 'off' },
        files: ['api-server/src/service/raw-data/RawDataController.ts'],
    },
    {
        rules: { 'no-invalid-this': 'off' },
        files: ['api-server/src/service/catalog/CatalogController.ts'],
    },
    {
        rules: { 'require-atomic-updates': 'off' },
        files: [
            'api-server/src/background-job/child-processes/preprocessing-data/add-coordinate.ts',
        ],
    },
    {
        rules: { 'new-cap': 'off' },
        files: ['api-server/src/service/CommonServiceControllerBase.ts'],
    },
];
