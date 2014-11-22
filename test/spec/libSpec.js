/**
 * FCUI lib spec
 * @param {Object} lib lib
 */
define('spec/libSpec', ['fcui/lib'], function (lib) {
    describe('FCUI lib', function() {
        it('can replace basic target content', function () {
            expect(lib.replaceTarget(
                '<!-- target: myTarget --> mycontent',
                'myTarget',
                'yourcontent'
            )).toBe(
                '<!-- target: myTarget --> yourcontent'
            );
        });
    });
});
