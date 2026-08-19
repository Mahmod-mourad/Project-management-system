import { Test } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { METHOD_METADATA, ROUTE_ARGS_METADATA } from "@nestjs/common/constants"
import { RouteParamtypes } from "@nestjs/common/enums/route-paramtypes.enum"
import request from "supertest"

import { AppModule } from "./app.module"
import { AuthController } from "./auth/auth.controller"
import { ProjectController } from "./project/project.controller"
import { TaskController } from "./task/task.controller"
import { TenantController } from "./tenant/tenant.controller"
import { UserController } from "./user/user.controller"

/**
 * These cover two mistakes that made the whole API unusable and that neither the
 * compiler nor the existing unit tests noticed.
 */

const CONTROLLERS = [
  AuthController,
  ProjectController,
  TaskController,
  TenantController,
  UserController,
]

/** Reads the parameter decorators Nest recorded for one handler. */
function paramTypesFor(prototype: Record<string, unknown>, method: string): number[] {
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, prototype.constructor, method) ?? {}

  // Keys look like "3:0" — the part before the colon is the RouteParamtypes value.
  return Object.keys(metadata).map((key) => Number(key.split(":")[0]))
}

describe("controller wiring", () => {
  it.each(CONTROLLERS.map((c) => [c.name, c] as const))(
    "%s: every POST and PATCH handler takes its DTO from @Body()",
    (_name, Controller) => {
      const prototype = Controller.prototype as unknown as Record<string, unknown>
      const methods = Object.getOwnPropertyNames(prototype).filter((m) => m !== "constructor")

      for (const method of methods) {
        const handler = prototype[method] as object
        const httpMethod = Reflect.getMetadata(METHOD_METADATA, handler)

        // 1 = POST, 3 = PATCH, 2 = PUT in Nest's RequestMethod enum.
        if (![1, 2, 3].includes(httpMethod)) continue

        const paramTypes = Reflect.getMetadata("design:paramtypes", prototype, method) ?? []
        const takesDto = paramTypes.some((type: { name?: string }) => type?.name?.endsWith("Dto"))

        if (!takesDto) continue

        // Without @Body(), Nest passes undefined and the handler silently writes
        // nothing. Every create and update in this project had that problem.
        expect(paramTypesFor(prototype, method)).toContain(RouteParamtypes.BODY)
      }
    },
  )
})

describe("application bootstrap", () => {
  let app: INestApplication

  beforeAll(async () => {
    process.env.SUPABASE_URL ??= "https://placeholder.supabase.co"
    process.env.SUPABASE_SERVICE_ROLE_KEY ??= "placeholder-service-role-key"
    process.env.JWT_SECRET ??= "test-secret"

    // The whole point: the application graph resolves. Every injected dependency
    // used to be imported with `import type`, which erases the import, leaves no
    // design:paramtypes metadata, and made Nest fail to resolve it — the API could
    // not start at all.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix("api/v1")
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app?.close()
  })

  it("starts", () => {
    expect(app).toBeDefined()
  })

  it("validates the login body instead of receiving undefined", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({})
      .expect(400)

    // Reaching validation at all proves the body is being injected. Before the
    // fix the DTO arrived as undefined and nothing was checked.
    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining("email")]),
    )
  })

  it("rejects an unauthenticated request to a tenant-scoped route", async () => {
    await request(app.getHttpServer()).get("/api/v1/projects").expect(401)
  })
})
