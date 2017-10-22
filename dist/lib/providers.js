"use strict";
exports.__esModule = true;
var data_1 = require("./data");
exports.registerProviders = function (container) {
    container.bind(data_1.Dynamo).to(data_1.Dynamo);
};
//# sourceMappingURL=providers.js.map