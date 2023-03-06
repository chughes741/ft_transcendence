import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * @param field? : optional User field to query
 * @GetUser Decorator.
 * @return User | any
 *
 * Returns a User object (as defined in prisma schema)
 * from an HTTP connection if no field is specified
 * If a field is specified, return its contents.
 *
 */
export const GetUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); // Exposes Express Request
    if (field) {
      return request.user[field];
    }
    return request.user;
  }
);

/**
 * @param field? : optional User field to query
 * @GetUserWs Decorator.
 * @return User | any
 *
 * Returns a User object (as defined in prisma schema)
 * from a WebSocket connection if no field is specified
 * If a field is specified, return its contents.
 *
 */
export const GetUserWs = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToWs().getClient();
    if (field) {
      return user[field];
    }
    return user;
  }
);
