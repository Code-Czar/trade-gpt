"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Explicitly type the parameters and return types
function mapToObject(map) {
    const obj = {};
    map.forEach((value, key) => {
        if (value instanceof Map) {
            obj[key] = mapToObject(value);
        }
        else if (Array.isArray(value)) {
            obj[key] = value.map(val => (val instanceof Map ? mapToObject(val) : val));
        }
        else if (typeof value === 'object' && value !== null) {
            obj[key] = objectToObject(value);
        }
        else {
            obj[key] = value;
        }
    });
    return obj;
}
// Explicitly type the parameters and return types
function objectToObject(obj) {
    const result = {};
    for (const key in obj) {
        const value = obj[key];
        if (value instanceof Map) {
            result[key] = mapToObject(value);
        }
        else if (Array.isArray(value)) {
            result[key] = value.map(val => (val instanceof Map ? mapToObject(val) : val));
        }
        else if (typeof value === 'object' && value !== null) {
            result[key] = objectToObject(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
const stringifyMap = (nestedMap) => __awaiter(void 0, void 0, void 0, function* () {
    const obj = mapToObject(nestedMap);
    const jsonString = JSON.stringify(obj);
    console.log(jsonString);
});
exports.default = {
    mapToObject,
    stringifyMap
};
//# sourceMappingURL=convertData.js.map