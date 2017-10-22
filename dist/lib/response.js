"use strict";
exports.__esModule = true;
var Response = (function () {
    function Response(statusCode, body, headers) {
        if (statusCode === void 0) { statusCode = 200; }
        if (body === void 0) { body = {}; }
        if (headers === void 0) { headers = {}; }
        this.statusCode = statusCode;
        this.body = body;
        this.headers = headers;
    }
    return Response;
}());
exports.Response = Response;
//# sourceMappingURL=response.js.map