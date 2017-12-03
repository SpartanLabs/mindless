"use strict";
exports.__esModule = true;
var Request = (function () {
    function Request(event) {
        this.event = event;
        if (event.body == "" || event.body == null) {
            this._body = {};
        }
        else {
            this._body = JSON.parse(event.body);
        }
        if (this.event.pathParameters == null) {
            this.event.pathParameters = {};
        }
        if (this.event.queryStringParameters == null) {
            this.event.queryStringParameters = {};
        }
        if (this.event.headers == null) {
            this.event.headers = {};
        }
    }
    Request.prototype.getResource = function () {
        return this.event.resource;
    };
    Request.prototype.getRequestMethod = function () {
        return this.event.httpMethod.toLowerCase();
    };
    Request.prototype.get = function (key) {
        if (this.event.pathParameters.hasOwnProperty(key)) {
            return this.event.pathParameters[key];
        }
        if (this.event.queryStringParameters.hasOwnProperty(key)) {
            return this.event.queryStringParameters[key];
        }
        if (this._body.hasOwnProperty(key)) {
            return this._body[key];
        }
        throw Error("Invalid key: '" + key + "' , key not found in pathParameters, queryStringParameters, or Body parameters.");
    };
    Request.prototype.header = function (key) {
        if (this.event.headers.hasOwnProperty(key)) {
            return this.event.headers[key];
        }
        throw Error("Invalid key: '" + key + "' , key not found in headers");
    };
    Request.prototype.add = function (key, val, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        if (overwrite || !this._body.hasOwnProperty(key)) {
            this._body[key] = val;
            return;
        }
        throw Error("The key '" + key + "' already exists, pass 'overwrite=true' or use a different key.");
    };
    return Request;
}());
exports.Request = Request;
//# sourceMappingURL=request.js.map