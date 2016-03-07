'use strict';

/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var omit = require('lodash.omit');

/**
 * Expose `Kenshoo` integration.
 */

var Kenshoo = module.exports = integration('Kenshoo')
    .global('kenshoo')
    .option('cid', '')
    // the {{ }} Handlebars tag is taken from here https://github.com/segment-integrations/analytics.js-integration-heap/blob/master/lib/index.js
    // my understanding is that analytics looks for an option with the same name and fills it in
    .tag('<script type="text/javascript" src="https://services.xg4ken.com/js/kenshoo.js?cid={{ cid }}"></script>');

/**
 * Initialize.
 *
 * Documentation:
 *
 * @api public
 */

Kenshoo.prototype.initialize = function () {
    this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Kenshoo.prototype.loaded = function () {
    return !!(window.kenshoo && window.kenshoo.cid);
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Kenshoo.prototype.track = function (track) {
    // these methods found here https://github.com/segmentio/facade#track
    var eventName = track.event();
    var props = track.properties();
    var kenshooObject = {
        conversionType: eventName,
        revenue: props.revenue || 0,
        currency: props.currency || 'USD',
        orderId: track.orderId() || ''
    };

    var propsOmitted = omit(props, ['revenue', 'currency', 'orderId']);
    var keys = Object.keys(propsOmitted);
    for (key in keys) {
        kenshooObject[key] = propsOmitted[key];
    }

    var sanitizedData = sanitizeData(kenshooObject);

    kenshoo.trackConversion('100', this.cid, kenshooObject);
};

function sanitizeData(data) {
    var myData = {};
    var keys = Object.keys(data);
    for (key in keys) {
        myData[key] = encodeURIComponent(data[key]);
    }

    return myData;
}