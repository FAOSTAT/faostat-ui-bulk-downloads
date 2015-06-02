define(['jquery',
        'handlebars',
        'text!faostat_ui_bulk_downloads/html/templates.hbs',
        'faostat_commons',
        'wds_client',
        'bootstrap',
        'sweetAlert'], function ($, Handlebars, templates, FAOSTATCommons, WDSClient) {

    'use strict';

    function BULK() {

        this.CONFIG = {
            lang: 'E',
            domain: null,
            lang_faostat: 'E',
            datasource: 'faostat',
            placeholder_id: 'placeholder',
            url_bulk_downloads: 'http://faostat3.fao.org/wds/rest',
            bulk_downloads_root: 'http://faostat.fao.org/Portals/_Faostat/Downloads/zip_files/',
            url_wds_crud: 'http://fenixapps2.fao.org/wds_5.1/rest/crud'
        };

    }

    BULK.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* Store FAOSTAT language. */
        this.CONFIG.lang_faostat = FAOSTATCommons.iso2faostat(this.CONFIG.lang);

    };

    BULK.prototype.create_flat_list = function() {

        /* this... */
        var _this = this;

        /* Initiate the WDS client. */
        var w = new WDSClient({
            datasource: this.CONFIG.datasource,
            serviceUrl: this.CONFIG.url_wds_crud
        });

        /* Fetch available bulk downloads. */
        w.wdsclient('bulkdownloads', this.CONFIG, function(json) {

            /* Create flat list. */
            var s = '';
            var source = $(templates).filter('#dropdown_item').html();
            var template = Handlebars.compile(source);
            for (var i = 0 ; i < json.length ; i++) {
                var name = json[i][3].replace(/\_/g,' ');
                name = name.substring(0, name.indexOf('('));
                var size = json[i][3].substring(1 + json[i][3].lastIndexOf('('), json[i][3].length - 1);
                var dynamic_data = {
                    item_url: _this.CONFIG.bulk_downloads_root + json[i][2],
                    item_text: name,
                    item_size: size
                };
                s += template(dynamic_data);
            }

            /* Render the list. */
            $('#' + _this.CONFIG.placeholder_id).html(s);

        }, this.CONFIG.url_bulk_downloads);

    };

    return BULK;

});