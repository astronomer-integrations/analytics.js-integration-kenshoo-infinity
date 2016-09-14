'use strict';

var integration = require('analytics.js-integration');

var Kenshoo = module.exports = integration('Kenshoo Infinity Pixel')
.global('kenshoo')
.option('cid', '')
.option('serverId', '')
// the {{ }} Handlebars tag is taken from here https://github.com/segment-integrations/analytics.js-integration-heap/blob/master/lib/index.js
// my understanding is that analytics looks for an option with the same name and fills it in
.tag('<script type="text/javascript" src="https://services.xg4ken.com/js/kenshoo.js?cid={{ cid }}"></script>');

Kenshoo.prototype.initialize = function () {
    this.load(this.ready);
};

Kenshoo.prototype.loaded = function () {
    return !!(window.kenshoo && window.kenshoo.cid);
};

Kenshoo.prototype.track = function (track) {
    // these methods found here https://github.com/segmentio/facade#track
    var eventName = track.event();
    var props = track.properties();
    var kenshooObject = {
        conversionType: eventName,
        revenue: track.revenue() || track.price() || 0,
        currency: props.currency || 'USD',
        orderId: track.orderId() || track.id() || ''
    };

    var otherProps = this.omit(props, ['revenue', 'currency', 'orderId', 'id']);
    for (var property in otherProps) {
        kenshooObject[property] = otherProps[property];
    }

    // all string properties for Kenshoo must be percent encoded
    var sanitizedData = {};
    for (var property in kenshooObject) {
        if (kenshooObject.hasOwnProperty(property) && (typeof kenshooObject[property] === 'string' || kenshooObject[property] instanceof String)) {
            sanitizedData[property] = kenshooObject[property].split(' ').join('_').toLowerCase();
        } else {
            sanitizedData[property] = kenshooObject[property];
        }
    }

    window.kenshoo.trackConversion(this.options.serverId, this.options.cid, sanitizedData);
};

Kenshoo.prototype.omit = function (obj, props) {
    var newObject = {};
    for (var property in obj) {
        if (!contains(props, property)) {
            newObject[property] = obj[property];
        }
    }

    return newObject;
};

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

