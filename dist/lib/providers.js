"use strict";
exports.__esModule = true;
var types_1 = require("./types");
var configs_1 = require("./configs");
var data_1 = require("./data");
exports.registerProviders = function (container) {
    if (!container.isBound(types_1.MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig)) {
        container.bind(types_1.MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig).to(configs_1.DefaultConfig);
    }
    container.bind(types_1.MINDLESS_SERVICE_INDENTIFIERS.Dynamo).to(data_1.Dynamo);
};
//# sourceMappingURL=providers.js.map