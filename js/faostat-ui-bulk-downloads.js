define(['jquery',
        'handlebars',
        'FAOSTAT_UI_COMMONS',
        'text!faostat_ui_bulk_downloads/html/templates.html',
        'i18n!faostat_ui_bulk_downloads/nls/translate',
        'bootstrap',
        'sweetAlert'], function ($, Handlebars, Commons, templates, translate) {

    'use strict';

    function BULK() {

        this.CONFIG = {
            lang: 'E',
            domain: null,
            lang_faostat: 'E',
            datasource: 'faostat',
            placeholder_id: 'placeholder',
            url_bulk_downloads: 'http://faostat3.fao.org/wds/rest/bulkdownloads',
            bulk_downloads_root: 'http://faostat.fao.org/Portals/_Faostat/Downloads/zip_files/'
        };

    }

    BULK.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Fix the language, if needed. */
        this.CONFIG.lang = this.CONFIG.lang != null ? this.CONFIG.lang : 'E';

        /* Store FAOSTAT language. */
        this.CONFIG.lang_faostat = Commons.iso2faostat(this.CONFIG.lang);

    };

    BULK.prototype.create_flat_list = function() {

        /* this... */
        var _this = this;

        /* Bulk downloads service URL. */
        var url = this.CONFIG.url_bulk_downloads + '/' + this.CONFIG.datasource + '/' + this.CONFIG.domain + '/' + this.CONFIG.lang;

        $.ajax({

            url: url,
            type: 'GET',
            dataType: 'json',

            success: function (response) {

                /* Cast the result, if required. */
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                /* Create flat list. */
                var s = '';
                var source = $(templates).filter('#dropdown_item').html();
                var template = Handlebars.compile(source);
                for (var i = 0 ; i < json.length ; i++) {
                    var name = json[i][3].replace(/\_/g,' ');
                    name = name.substring(0, name.indexOf('('));
                    var size = json[i][3].substr(json[i][3].indexOf('('), json[i][3].indexOf(')'));
                    var dynamic_data = {
                        item_url: _this.CONFIG.bulk_downloads_root + json[i][2],
                        item_text: name,
                        item_size: size
                    };
                    s += template(dynamic_data);
                }

                /* Render the list. */
                $('#' + _this.CONFIG.placeholder_id).html(s);

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

    BULK.prototype.create_drop_down_button = function() {

        /* this... */
        var _this = this;

        /* Bulk downloads service URL. */
        var url = this.CONFIG.url_bulk_downloads + '/' + this.CONFIG.datasource + '/' + this.CONFIG.domain + '/' + this.CONFIG.lang;

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
                        item_url: _this.CONFIG.bulk_downloads_root + json[i][2],
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