/* eslint-disable */

var fs = require('fs');
var chalk = require('chalk');

module.exports = {
    input: [
        'src/**/*.{js,jsx,ts,tsx}',
        // Use ! to filter out files or directories
        '!**/node_modules/**',
    ],
    output: './',
    options: {
        debug: true,
        removeUnusedKeys: true,
        sort: true,
        attr: {
          list: ['data-i18n'],
          extensions: ['.html', '.htm']
        },
        func: {
            list: ['i18next.t', 'i18n.t', 't', '_t', '__t', 't_', 't__'],
            extensions: ['.ts', 'tsx', '.js', 'jsx']
        },
        trans: {
            component: 'Trans',
            i18nKey: 'i18nKey',
            defaultsKey: 'defaults',
            extensions: [],
            fallbackKey: function(ns, value) {
                return value;
            },
        },
        lngs: ['pt'],
        ns: ['translation'],
        defaultLng: 'pt',
        defaultNs: 'translation',
        defaultValue: '__STRING_NOT_TRANSLATED__',
        resource: {
            loadPath: './src/shared/i18n/locales/{{lng}}/{{ns}}.json',
            savePath: './{{lng}}/{{ns}}.json',
            jsonIndent: 2,
            lineEnding: 'lf'
        },
        nsSeparator: ':',
        keySeparator: '.',
        pluralSeparator: '_',
        contextSeparator: '_',
        contextDefaultValues: ['male', 'female'],
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    }
};
