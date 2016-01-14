/*global define*/
define(['jquery',
        'loglevel',
        'handlebars',
        'faostat-ui/config/Config',
        'faostat-ui/globals/Common',
        'text!faostat_ui_bulk_downloads/html/templates.hbs',
        'faostatapiclient',
        'i18n!faostat_ui_bulk_downloads/nls/translate',
        'faostat-ui/lib/download/go_to_section/go-to-section'
        ], function ($, log, Handlebars, Config, Common, templates, FAOSTATAPIClient, translate, GoToSection) {

    'use strict';

    function BULK() {

        this.s = {

            BULK_DOWNLOADS: '#bulk-download-items',
            GO_TO_SECTION: '#go-to-section'

        };

        this.CONFIG = {
            placeholder_id: 'placeholder',
            bulk_downloads_root: 'http://faostat.fao.org/Portals/_Faostat/Downloads/zip_files/',
            rendered: false
        };

    }

    BULK.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        //this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

        /* Initiate FAOSTAT API's client. */
        this.CONFIG.api = new FAOSTATAPIClient();

        /* Container */
        this.$CONTAINER = $('#' + this.CONFIG.placeholder_id);

        /* init variables */
        this.$CONTAINER.html($(templates).filter('#template').html());

        this.$BULK_DOWNLOADS = this.$CONTAINER.find(this.s.BULK_DOWNLOADS);
        this.$GO_TO_SECTION = this.$CONTAINER.find(this.s.GO_TO_SECTION);

    };

    BULK.prototype.isRendered = function () {
        return this.CONFIG.rendered;
    };

    BULK.prototype.isNotRendered = function () {
        return !this.CONFIG.rendered;
    };

    BULK.prototype.create_flat_list = function () {

        log.info(this.CONFIG.placeholder_id)

        /* this... */
        var that = this,
            i,
            name,
            size,
            sizeUnit = 'MB',
            dynamic_data;

        /* Fetch available bulk downloads. */
        this.CONFIG.api.bulkdownloads({
            datasource: Config.DATASOURCE,
            lang: Common.getLocale(),
            domain_code: this.CONFIG.domain
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
                    item_url: that.CONFIG.bulk_downloads_root + json.data[i].FileName,
                    item_text: name,
                    item_size: size + ' ' + sizeUnit
                });
            }

            log.info(bulk_downloads_list)

            if (bulk_downloads_list.length <= 0) {
                bulk_downloads_list = null;
            }

            that.$BULK_DOWNLOADS.html(t({
                bulk_downloads_list: bulk_downloads_list,
                no_bulk_downlaod_available: translate.no_bulk_downlaod_available,
                bulk_downloads: translate.bulk_downloads
            }));

            new GoToSection().init({
                container: that.$GO_TO_SECTION,
                domain_code: that.CONFIG.domain
            });

        });

    };

    BULK.prototype.dispose = function () {

    };

    return BULK;

});