(function($) {
    'use strict';

    function log(message, data) {
        if (window.console && window.console.log) {
            if (typeof data !== 'undefined') {
                window.console.log(message, data);
            } else {
                window.console.log(message);
            }
        }
    }

    function normalize(value) {
        var accents = {
            'a': /[àáâãäå]/g,
            'e': /[èéêë]/g,
            'i': /[ìíîï]/g,
            'o': /[òóôõö]/g,
            'u': /[ùúûü]/g,
            'c': /ç/g,
            'n': /ñ/g
        };
        var letter;

        value = String(value || '')
            .replace(/^\s+|\s+$/g, '')
            .toLowerCase();

        for (letter in accents) {
            if (accents.hasOwnProperty(letter)) {
                value = value.replace(accents[letter], letter);
            }
        }

        return value;
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function matches(title) {
        var found = [];
        var normalizedTitle = normalize(title);
        var terms = atbTitleWarning.terms || [];
        var i;
        var normalizedTerm;
        var expression;

        for (i = 0; i < terms.length; i++) {
            normalizedTerm = normalize(terms[i]);

            if (!normalizedTerm) {
                continue;
            }

            expression = new RegExp(
                '(^|[^a-z0-9_])' +
                escapeRegExp(normalizedTerm) +
                '($|[^a-z0-9_])',
                'i'
            );

            if (expression.test(normalizedTitle)) {
                found.push(terms[i]);
            }
        }

        return found;
    }

    function showWarning() {
        var $title = $('#title');
        var found = matches($title.val());
        var $warning = $('#atb-title-warning');
        var text;
        var i;

        if (!$title.length) {
            log('ATB: campo #title não encontrado.');
            return;
        }

        if (!$warning.length) {
            $warning = $('<p id="atb-title-warning" role="alert"></p>');

            $warning.css({
                'color': '#b32d2e',
                'font-weight': 'bold',
                'margin': '8px 0 0',
                'padding': '8px 10px',
                'background': '#fbeaea',
                'border-left': '4px solid #dc3232'
            });

            if ($('#titlewrap').length) {
                $('#titlewrap').after($warning);
            } else {
                $title.after($warning);
            }
        }

        if (!found.length) {
            $warning.hide().text('');

            $title.css({
                'border': '',
                'box-shadow': ''
            });

            return;
        }

        $title.css({
            'border': '2px solid #dc3232',
            'box-shadow': '0 0 3px rgba(220, 50, 50, 0.45)'
        });

        if (found.length === 1) {
            text = atbTitleWarning.singular.replace(
                '%s',
                '"' + found[0] + '"'
            );
        } else {
            for (i = 0; i < found.length; i++) {
                found[i] = '"' + found[i] + '"';
            }

            text = atbTitleWarning.plural.replace(
                '%s',
                found.join(', ')
            );
        }

        $warning.text(text).show();
        log('ATB: termo encontrado:', found);
    }

    $(function() {
        if (typeof atbTitleWarning === 'undefined') {
            log('ATB: configuração de termos não foi recebida.');
            return;
        }

        log(
            'ATB: title-warning.js carregado. Termos:',
            atbTitleWarning.terms
        );

        /*
         * bind funciona no jQuery antigo presente no WordPress 4.9.
         */
        $('#title').bind('keyup change input paste', showWarning);

        showWarning();
    });
})(jQuery);