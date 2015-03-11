define(function() {

    var config = {
        paths: {
            FAOSTAT_BULK_DOWNLOADS: 'faostat-bulk-downloads',
            faostat_bulk_downloads: '../'
        },
        shim: {
            bootstrap: {
                deps: ['jquery']
            }
        }
    };

    return config;

});