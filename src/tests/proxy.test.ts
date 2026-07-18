/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { proxy } from "../proxy";

describe("Route Guard proxy middleware", () => {
  const buildMockRequest = (path: string, roleCookieValue?: string) => {
    return {
      cookies: {
        get: (name: string) => {
          if (name === "user_role" && roleCookieValue !== undefined) {
            return { value: roleCookieValue };
          }
          return undefined;
        }
      },
      nextUrl: {
        pathname: path,
        clone: () => new URL("http://localhost:3000" + path),
      }
    } as any;
  };

  it("should allow request when visiting non-protected path", () => {
    const req = buildMockRequest("/about");
    const res = proxy(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
  });

  const roles = ["fan", "volunteer", "security", "operations"];

  roles.forEach(role => {
    describe(`Role-based guarding for /${role}`, () => {
      it("should redirect to / when there is no user_role cookie", () => {
        const req = buildMockRequest(`/${role}/dashboard`);
        const res = proxy(req);
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe("http://localhost:3000/");
      });

      it(`should redirect to / when user_role is wrong (e.g. guest)`, () => {
        const req = buildMockRequest(`/${role}/dashboard`, "guest");
        const res = proxy(req);
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe("http://localhost:3000/");
      });

      it(`should redirect to / when user_role is another role`, () => {
        const wrongRole = role === "fan" ? "volunteer" : "fan";
        const req = buildMockRequest(`/${role}/dashboard`, wrongRole);
        const res = proxy(req);
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe("http://localhost:3000/");
      });

      it(`should allow request when user_role matches exactly (${role})`, () => {
        const req = buildMockRequest(`/${role}/dashboard`, role);
        const res = proxy(req);
        expect(res.status).toBe(200);
      });
    });
  });
});
