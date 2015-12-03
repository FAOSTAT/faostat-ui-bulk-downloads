/*global define*/
define(['jquery',
        'handlebars',
        'config/Config',
        'text!faostat_ui_bulk_downloads/html/templates.hbs',
        'faostat_commons',
        'faostatapiclient',
        'i18n!faostat_ui_bulk_downloads/nls/translate',
        'bootstrap',
        'sweetAlert'], function ($, Handlebars, Config, templates, FAOSTATCommons, FAOSTATAPIClient, translate) {

    'use strict';

    function BULK() {

        this.CONFIG = {
            lang: 'E',
            domain: null,
            lang_faostat: 'E',
            datasource: 'faostat',
            placeholder_id: 'placeholder',
            url_rest: 'http://fenixapps2.fao.org/wds_5.2/rest',
            url_bulk_downloads: 'http://fenixapps2.fao.org/wds_5.2/rest',
            bulk_downloads_root: 'http://faostat.fao.org/Portals/_Faostat/Downloads/zip_files/',
            url_wds_crud: 'http://fenixapps2.fao.org/wds_5.2/rest/crud',
            rendered: false
        };

    }

    BULK.prototype.init = function (config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang !== null ? this.CONFIG.lang : 'en';

        /* Store FAOSTAT language. */
        this.CONFIG.lang_faostat = FAOSTATCommons.iso2faostat(this.CONFIG.lang);

        /* Initiate FAOSTAT API's client. */
        this.CONFIG.api = new FAOSTATAPIClient();

    };

    BULK.prototype.isRendered = function () {
        return this.CONFIG.rendered;
    };

    BULK.prototype.isNotRendered = function () {
        return !this.CONFIG.rendered;
    };

    BULK.prototype.create_flat_list = function () {

        /* this... */
        var that = this,
            i,
            name,
            size,
            dynamic_data;

        /* Fetch available bulk downloads. */
        this.CONFIG.api.bulkdownloads({
            datasource: Config.DATASOURCE,
            lang: this.CONFIG.lang,
            domain_code: this.CONFIG.domain
        }).then(function (json) {

            /* Courtesy message when no bulk download is available. */
            if (json.length === 0) {

                /* Render the list. */
                $('#' + that.CONFIG.placeholder_id).html('<h1 class="text-center">' + translate.courtesy + '</h1>');

            } else {

                /* Create flat list. */
                var s = '',
                    source = $(templates).filter('#dropdown_item').html(),
                    template = Handlebars.compile(source);
                for (i = 0; i < json.data.length; i += 1) {
                    name = json.data[i].FileContent.replace(/\_/g, ' ');
                    name = name.substring(0, name.indexOf('('));
                    size = json.data[i].FileContent.substring(1 + json.data[i].FileContent.lastIndexOf('('), json.data[i].FileContent.length - 1);
                    if (json.data[i].FileContent.indexOf('(Norm)') > -1) {
                        name += ' (Norm)';
                    }
                    dynamic_data = {
                        item_url: that.CONFIG.bulk_downloads_root + json.data[i].FileName,
                        item_text: name,
                        item_size: size
                    };
                    s += template(dynamic_data);
                }

                /* Render the list. */
                $('#' + that.CONFIG.placeholder_id).html(s);

                /* Rendered. */
                that.CONFIG.rendered = true;

            }

        });

    };

    BULK.prototype.dispose = function () {

    };

    return BULK;

});