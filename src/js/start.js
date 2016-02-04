/*global define*/
define(['jquery',
        'loglevel',
        'handlebars',
        'config/Config',
        'globals/Common',
        'text!faostat_ui_bulk_downloads/html/templates.hbs',
        'faostatapiclient',
        'i18n!faostat_ui_bulk_downloads/nls/translate',
        'lib/download/go_to_section/go-to-section'
        ], function ($, log, Handlebars, C, Common, templates, FAOSTATAPIClient, translate, GoToSection) {

    'use strict';

    var s = {

        BULK_DOWNLOADS: '#bulk-download-items',
        GO_TO_SECTION: '#go-to-section'

    }, defaultOptions = {

        bulk_downloads_root: C.URL_BULK_DOWNLOADS_BASEPATH

    };

    function BULK() {

        log.info('Bulk');

    }

    BULK.prototype.init = function (config) {

        this.o = $.extend(true, {}, defaultOptions, config);

        log.info(this.o);

        /* Initiate FAOSTAT API's client. */
        this.api = new FAOSTATAPIClient();

        /* Container */
        this.$CONTAINER = $(this.o.container);
        this.$CONTAINER.html('daje');

        log.info(this.o.container)
        /* init variables */
        this.$CONTAINER.html($(templates).filter('#template').html());

        this.$BULK_DOWNLOADS = this.$CONTAINER.find(s.BULK_DOWNLOADS);
        this.$GO_TO_SECTION = this.$CONTAINER.find(s.GO_TO_SECTION);

        this.createBulkDownloadList();

    };

    BULK.prototype.createBulkDownloadList = function () {

        log.info('BULk; this.$CONTAINER', this.$CONTAINER.length);

        /* this... */
        var that = this,
            i,
            name,
            size,
            sizeUnit = 'MB';

        /* Fetch available bulk downloads. */
        this.api.bulkdownloads({
            datasource: C.DATASOURCE,
            lang: Common.getLocale(),
            domain_code: this.o.code
        }).then(function (json) {

            /* prepare json */
            var bulk_downloads_list = [],
                source = $(templates).filter('#dropdown_items').html(),
                t = Handlebars.compile(source);

            for (i = 0; i < json.data.length; i += 1) {
                name = json.data[i].FileContent.replace(/\_/g, ' ');
                name = name.substring(0, name.indexOf('('));
                size = json.data[i].FileContent.substring(1 + json.data[i].FileContent.lastIndexOf('('), json.data[i].FileContent.length - 1);
                if (json.data[i].FileContent.indexOf('(Norm)') > -1) {
                    name += ' (Norm)';
                }

                // TODO: add a check
                // conversion from KB to MB
                size = (parseFloat(size.substring(0, size.indexOf(' ')).replace(',', '').replace('.', '')) * 0.001).toFixed(2);

                bulk_downloads_list.push( {
                    item_url: that.o.bulk_downloads_root + json.data[i].FileName,
                    item_text: name,
                    item_size: size + ' ' + sizeUnit
                });
            }

            log.info('BULk; bulk_downloads_list', bulk_downloads_list);

            if (bulk_downloads_list.length <= 0) {
                bulk_downloads_list = null;
            }

            that.$BULK_DOWNLOADS.html(t({
                bulk_downloads_list: bulk_downloads_list,
                no_bulk_downlaod_available: translate.no_bulk_downlaod_available,
                bulk_downloads: translate.bulk_downloads,
                bulk_downloads_welcome: translate.bulk_downloads_welcome
            }));

            new GoToSection().init({
                container: that.$GO_TO_SECTION,
                domain_code: that.o.code
            });

        });

    };

    BULK.prototype.dispose = function () {

        this.$CONTAINER.empty();

    };

    return BULK;

});