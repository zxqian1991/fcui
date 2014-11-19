require.config({
    'baseUrl': '../../src',
    'paths': { 'css': '../demo/loader/css' },
    'packages': [
        {
            'name': 'esui',
            'location': '../dep/esui/3.1.0-beta.3/src',
            'main': 'main'
        },
        {
            'name': 'mini-event',
            'location': '../dep/mini-event/1.0.2/src',
            'main': 'main'
        },
        {
            'name': 'underscore',
            'location': '../dep/underscore/1.5.2/src',
            'main': 'underscore'
        },
        {
            'name': 'moment',
            'location': '../dep/moment/2.7.0/src',
            'main': 'moment'
        },
        {
            'name': 'etpl',
            'location': '../dep/etpl/3.0.0/src',
            'main': 'main'
        },
        {
            'name': 'ef',
            'location': '../dep/ef/3.1.0-beta.2/src',
            'main': 'main'
        },
        {
            'name': 'eoo',
            'location': '../dep/eoo/0.1.1/src',
            'main': 'main'
        },
        {
            'name': 'er',
            'location': '../dep/er/3.1.0-beta.5/src',
            'main': 'main'
        },
        {
            'name': 'ub-ria',
            'location': '../dep/ub-ria/1.0.0-alpha.7/src',
            'main': 'main'
        }
    ]
});
document.createElement('header');
var prefix = 'esui-';
var elements = [
    'Calendar', 'Crumb', 'Dialog', 'Label', 'Month-View', 'Pager', 'Panel', 'Range-Calendar',
    'Region', 'Rich-Calendar', 'Schedule', 'Search-Box', 'Sidebar', 'Select', 'Tab', 'Table',
    'Text-Box', 'Text-Line', 'Tip', 'Tip-Layer', 'Tree', 'Wizard'
];

for (var i = elements.length - 1; i > -1; --i) {
    document.createElement(prefix + elements[i]);
}