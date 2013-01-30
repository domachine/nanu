/*jslint nomen: true, node: true, devel: true, maxlen: 79 */
'use strict';
var _request = require('request'),
    Nanu,
    DesignDoc;
function lightCopy(object) {
    var newObject = {},
        key;
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            newObject[key] = object[key];
        }
    }
    return newObject;
}
function request(options, callback) {
    if (callback) {
        return _request(options, function (error, res) {
            var e;
            if (error) {
                callback(error, res);
            } else {
                if (typeof res.body === 'string') {
                    res.body = JSON.parse(res.body);
                }
                if (
                    res.statusCode >= 200
                        && res.statusCode <= 202
                ) {
                    callback(null, res.body);
                } else {
                    e = new Error(res.body.error + ': '
                                  + res.body.reason);
                    e.error = res.body.error;
                    e.reason = res.body.reason;
                    callback(e, res);
                }
            }
        });
    } else {
        return _request(options);
    }
}
exports.Nanu = Nanu = function (database, host) {
    var that = this,
        nano,
        proto = '__proto__',
        p = {},
        key;
    this._host = host || 'http://localhost:5984';
    this._database = database;

    /* Missing features are always backed by nano. */

    nano = require('nano')(this._host).use(this._database);
    p = lightCopy(Nanu.prototype);
    p[proto] = nano;
    this[proto] = p;
};
exports.DesignDoc = DesignDoc = function (designdoc) {
    this._design = designdoc;
};
Nanu.prototype.design = function (designName) {
    var d = new DesignDoc(designName),
        proto = '__proto__',
        p,
        key;

    /* To create a scoped design-document we slurp all the design doc prototype
     * properties into the given design doc object. */

    p = lightCopy(DesignDoc.prototype);
    p[proto] = this;
    d[proto] = p;
    return d;
};
Nanu.prototype.get = function (id, options, callback) {
    options = options || {};
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options.url = options.uri = this._host + '/' + this._database
        + '/' + id;
    return request(options, callback);
};
Nanu.prototype.insert = function (doc, options, callback) {
    options = options || {};
    if (typeof options === 'function') {
        callback = options;
        options = {};
    } else if (options === undefined) {
        options = {};
    }
    options.json = true;
    options.body = doc;
    options.url = this._host + '/' + this._database;
    if (doc._id) {
        options.url += '/' + doc._id;
        options.method = 'PUT';
    } else {
        options.method = 'POST';
    }
    return request(options, callback);
};
DesignDoc.prototype.view = function (view, options, callback) {
    options = options || {};
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (options.key) {
        options.qs = options.qs || {};
        options.qs.key = JSON.stringify(options.key);
        delete options.key;
    }
    options.url = options.uri = this._host + '/' + this._database
        + '/_design/' + this._design + '/_view/' + view;
    return request(options, callback);
};
DesignDoc.prototype.update = function (handler, options, id, callback) {

    /* The options and the id parameter are optional so we have to figure out
     * if and at which position a callback was given. */

    options = options || {};
    if (typeof options === 'string') {
        id = options;
        options = {};
    } else if (typeof options === 'function') {
        callback = options;
    }
    if (typeof id === 'function') {
        callback = id;
        id = undefined;
    }
    var url = this._host + '/' + this._database
            + '/_design/' + this._design + '/_update/' + handler;

    /* Then we construct the url and the request method dependent on the fact
     * that an id was given or not. */

    if (id) {
        url += '/' + id;
        options.method = 'PUT';
    } else {
        options.method = 'POST';
    }
    options.url = options.uri = url;
    return request(options, callback);
};
