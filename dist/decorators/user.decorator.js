"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const common_1 = require("@nestjs/common");
exports.User = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user?.id) {
        return {
            id: request.user.id,
            role: request.user.role,
            departmentId: request.user.departmentId ?? null,
        };
    }
    const userId = request.headers['x-user-id'];
    return userId ? { id: userId } : undefined;
});
//# sourceMappingURL=user.decorator.js.map