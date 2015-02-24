define(['jquery',
        'handlebars',
        'text!faostat_bulk_downloads/html/templates.html',
        'i18n!faostat_bulk_downloads/nls/translate',
        'bootstrap',
        'sweet-alert'], function ($, Handlebars, templates, translate) {

    'use strict';

    function BULK() {

        this.CONFIG = {
            lang: 'E',
            placeholder_id: 'placeholder',
            datasource: 'faostat',
            bulks_url: 'http://faostat3.fao.org/wds/rest/bulkdownloads',
            bulks_root: 'http://faostat.fao.org/Portals/_Faostat/Downloads/zip_files/',
            domain: null
        };

    }

    BULK.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* this... */
        var _this = this;

        /* Bulk downloads service URL. */
        var url = this.CONFIG.bulks_url + '/' + this.CONFIG.datasource + '/' + this.CONFIG.domain + '/' + this.CONFIG.lang;

        $.ajax({

            url: url,
            type: 'GET',
            dataType: 'json',

            success: function (response) {

                /* Cast the result, if required. */
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                /* Load button template. */
                var source = $(templates).filter('#dropdown_button').html();
                var template = Handlebars.compile(source);
                var dynamic_data = {
                    button_label: translate.button_label
                };
                var html = template(dynamic_data);
                $('#' + _this.CONFIG.placeholder_id).html(html);

                /* Create entries for the item list. */
                var s = '';
                source = $(templates).filter('#dropdown_item').html();
                template = Handlebars.compile(source);
                for (var i = 0 ; i < json.length ; i++) {
                    dynamic_data = {
                        item_url: _this.CONFIG.bulks_root + json[i][2],
                        item_text: json[i][3].replace(/\_/g,' ')
                    };
                    s += template(dynamic_data);
                }

                /* Append items to the button. */
                $('#item_list').append(s);

            },

            error: function (a, b, c) {
                swal({
                    title: translate.error,
                    type: 'error',
                    text: a
                });
            }

        });

    };

    return BULK;

});