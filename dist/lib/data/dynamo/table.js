"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var inversify_1 = require("inversify");
var DynamoTable = (function () {
    function DynamoTable(dynamo) {
        this.dynamo = dynamo;
    }
    DynamoTable.prototype.registerTable = function () {
        this._dynamoTable = this.dynamo.addDefinition(this.tableName, this.definition);
    };
    DynamoTable.prototype.create = function (data, params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        var promiseCallback = function (resolve, reject) {
            var createModelCallback = function (err, model) {
                if (err) {
                    console.error('Error creating a entry on ' + _this.tableName + ' table. Err: ', err);
                    reject(err);
                }
                else {
                    var m = _this.transformToModel(model);
                    console.log("model: ", m);
                    resolve(m);
                }
            };
            _this._dynamoTable.create(data, params, createModelCallback);
        };
        return new Promise(promiseCallback);
    };
    DynamoTable.prototype.getAll = function () {
        var _this = this;
        var transform = function (models) { return models.map(function (model) { return _this.transformToModel(model); }); };
        return this.getAllBase(transform);
    };
    DynamoTable.prototype.getAllRaw = function () {
        return this.getAllBase(function (x) { return x; });
    };
    DynamoTable.prototype.getAllBase = function (transform) {
        var _this = this;
        var promiseCallback = function (resolve, reject) {
            var callback = function (err, models) {
                if (err) {
                    console.error('Error retrieving all models on ' + _this.tableName + ' table. Err: ', err);
                    reject(err);
                }
                else {
                    models = transform(models.Items);
                    resolve(models);
                }
            };
            _this._dynamoTable.scan().loadAll().exec(callback);
        };
        return new Promise(promiseCallback);
    };
    DynamoTable = __decorate([
        inversify_1.injectable()
    ], DynamoTable);
    return DynamoTable;
}());
exports.DynamoTable = DynamoTable;
//# sourceMappingURL=table.js.map