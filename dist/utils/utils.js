"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStringId = void 0;
const mongoose_1 = require("mongoose");
const generateStringId = () => {
    return new mongoose_1.Types.ObjectId().toHexString();
};
exports.generateStringId = generateStringId;
//# sourceMappingURL=utils.js.map