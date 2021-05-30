import faker from 'faker'
import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app'

let connection: Connection
describe("Authenticate user contoller", () => {
    const clearDatabase = async () => {
        await connection.query("DELETE FROM USERS WHERE $1", [1])
        await connection.query("DELETE FROM STATEMENTS WHERE $1", [1])
    }
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()
    })
    afterAll(async () => {
        await clearDatabase()
        await connection.close()
    })
    beforeEach(async () => {
        await clearDatabase()
    })

    it("Should be able to authenticate an user", async () => {
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        await request(app)
            .post("/api/v1/users")
            .send(user)

        const response = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: user.password
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("token")
        expect(response.body).toMatchObject({
            user: {
                email: user.email,
                name: user.name
            }
        })
    })
    it("Should not be able to authenticate an unregistered user", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: faker.internet.email(),
            password: faker.internet.password()
        })

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject({
            message: "Incorrect email or password"
        })
    })
    it("Should not be able to authenticate with wrong password", async()=>{
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        await request(app)
            .post("/api/v1/users")
            .send(user)

        const response = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: faker.internet.password()
        })

        expect(response.status).toBe(401)
        expect(response.body).toMatchObject({
            message: "Incorrect email or password"
        })
    })
})