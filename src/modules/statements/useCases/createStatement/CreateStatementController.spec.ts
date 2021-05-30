import faker from 'faker'
import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app'

let connection: Connection
const user = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
}
let token: string
describe("Create statement controller", () => {
    const clearDatabase = async () => {
        await connection.query("DELETE FROM STATEMENTS WHERE $1", [1])
    }
    beforeAll(async () => {
        connection = await createConnection()

        await request(app).post('/api/v1/users').send(user)

        const response = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: user.password
        })
        token = response.body.token
    })
    afterAll(async () => {
        await clearDatabase()
        await connection.close()
    })
    beforeEach(async () => {
        await clearDatabase()
    })

    it("Should be able to create a deposit statement", async () => {
        const deposit = {
            amount: faker.datatype.number(1000),
            description: faker.lorem.words(3)
        }
        const response = await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Bearer ${token}`)
            .send(deposit)
        
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(deposit)
    })

    it("Should be able to create a withdraw statement", async () => {
        const deposit = {
            amount: faker.datatype.number(1000),
            description: faker.lorem.words(3)
        }
        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Bearer ${token}`)
            .send(deposit)

        const withdraw = {
            amount: faker.datatype.number(deposit.amount),
            description: faker.lorem.words(3)
        }    
        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .set('Authorization', `Bearer ${token}`)
            .send(withdraw)
        
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(withdraw)
    })
})