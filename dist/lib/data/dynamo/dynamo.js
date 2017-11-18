"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
var types_1 = require("../../types");
var dyn = require("dynogels");
var inversify_1 = require("inversify");
var Dynamo = (function () {
    function Dynamo(config) {
        this.config = config;
        dyn.AWS.config.update({ region: "us-east-1", accessKeyId: "abcd", secretAccessKey: "secret" });
        var opts = { endpoint: config.dynamoEndpoint };
        console.log(config);
        dyn.dynamoDriver(new dyn.AWS.DynamoDB(opts));
    }
    Dynamo.prototype.addDefinition = function (tableName, tableDefnition) {
        return dyn.define(tableName, tableDefnition);
    };
    Dynamo.prototype.createTables = function () {
        dyn.createTables(function (err) {
            if (err) {
                console.log('Dynamo error creating tables: ', err);
            }
            else {
                console.log('successfully created tables');
            }
        });
    };
    Dynamo = __decorate([
        inversify_1.injectable(),
        __param(0, inversify_1.inject(types_1.MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig))
    ], Dynamo);
    return Dynamo;
}());
exports.Dynamo = Dynamo;
//# sourceMappingURL=dynamo.js.map