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
        this._model = this.dynamo.addDefinition(this.tableName, this.definition);
    };
    DynamoTable.prototype.create = function (data, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var promiseCallback = function (resolve, reject) {
            var createModelCallback = function (err, model) {
                if (err) {
                    console.error('Error creating a entry on ' + _this.tableName + ' table. Err: ', err);
                    reject(err);
                }
                else {
                    var m = _this.transformToModel(model);
                    resolve(m);
                }
            };
            _this._model.create(data, options, createModelCallback);
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
            _this._model.scan().loadAll().exec(callback);
        };
        return new Promise(promiseCallback);
    };
    DynamoTable.prototype.update = function (data, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var promiseCallback = function (resolve, reject) {
            var callback = function (err, item) {
                if (err) {
                    console.error('Error updating item on ' + _this.tableName + ' table. Err: ', err);
                    reject(err);
                }
                else {
                    resolve(_this.transformToModel(item));
                }
            };
            _this._model.update(data, options, callback);
        };
        return new Promise(promiseCallback);
    };
    DynamoTable.prototype["delete"] = function (hashKey, rangeKey, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var promiseCallback = function (resolve, reject) {
            var callback = function (err, item) {
                if (err) {
                    console.error('Error updating item on ' + _this.tableName + ' table. Err: ', err);
                    reject(err);
                }
                else {
                    resolve(_this.transformToModel(item));
                }
            };
            if (rangeKey == null) {
                _this._model.destroy(hashKey, options, callback);
            }
            else {
                _this._model.destroy(hashKey, rangeKey, options, callback);
            }
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