import request from 'supertest'
import faker from 'faker'
import { app } from '../../../../app'
import { Connection, createConnection } from 'typeorm'

let connection: Connection
describe("Create user controller", () => {
    const clearDatabase = async () => {
        await connection.query("DELETE FROM USERS WHERE $1", [
            true
        ])
        await connection.query("DELETE FROM STATEMENTS WHERE $1", [
            true
        ])
    }
    beforeAll(async () => {
        connection = await createConnection()
    })
    afterAll(async () => {
        await clearDatabase()
        await connection.close()
    })
    beforeEach(async () => {
        await clearDatabase()
    })
    it("Should be able to create an user", async () => {
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const response = await request(app)
            .post('/api/v1/users')
            .send(user)

        expect(response.status).toBe(201)
    })
    it("Should not be able to create an user with an email already registered", async () => {
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        await request(app)
            .post('/api/v1/users')
            .send(user)

        const response = await request(app)
            .post('/api/v1/users')
            .send(user)

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("User already exists")
    })
})