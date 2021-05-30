import faker from 'faker'
import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app'

let connection: Connection
let user = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
}
describe("Show user profile integration tests", () => {
    const clearDatabase = async () => {
        await connection.query("DELETE FROM USERS WHERE $1", [1])
    }
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()
        await clearDatabase()

        await request(app).post("/api/v1/users").send(user)
    })
    afterAll(async () => {
        await clearDatabase()
        await connection.close()
    })

    it("Should be able to show a profile for a registered user", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: user.password
        })

        const { token } = response.body

        const profileResponse = await request(app)
            .get("/api/v1/profile")
            .set('Authorization', `Bearer ${token}`)

        expect(profileResponse.body).toMatchObject({
            email: user.email,
            name: user.name
        })
    })
    it("Should not be able to show a profile for a non registered user", async () => {
        const token = faker.datatype.uuid()
        const profileResponse = await request(app)
            .get("/api/v1/profile")
            .set('Authorization', `Bearer ${token}`)

        expect(profileResponse.status).toBe(401)
        expect(profileResponse.body).toMatchObject({
            message: "JWT invalid token!"
        })
    })
})