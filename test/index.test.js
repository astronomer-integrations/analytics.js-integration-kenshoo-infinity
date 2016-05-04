'use strict';

var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Kenshoo = require('../lib');

describe('Kenshoo', function () {
    var analytics;
    var kenshoo;
    var options = {
        serverId: '1234',
        cid: 'mycid'
    };

    beforeEach(function () {
        analytics = new Analytics;
        kenshoo = new Kenshoo(options);
        analytics.use(Kenshoo);
        analytics.use(tester);
        analytics.add(kenshoo);
    });

    afterEach(function () {
        analytics.restore();
        analytics.reset();
        kenshoo.reset();
        sandbox();
    });

    describe('after loading', function () {
        beforeEach(function (done) {
            analytics.once('ready', done);
            analytics.initialize();
        });

        it('should call trackConversion', function () {
            analytics.stub(window.kenshoo, 'trackConversion');
            analytics.track('my event', {
                hello: 'hello world',
                orderId: '1234',
                revenue: 44
            });
            analytics.called(window.kenshoo.trackConversion, '1234', 'mycid', {conversionType: 'my_event', hello: 'hello_world', orderId: '1234', revenue: 44, currency: 'USD'});
        });
    });
});
