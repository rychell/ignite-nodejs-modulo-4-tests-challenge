import faker from 'faker'
import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app'

let connection: Connection
let token: string

const user = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password()
}
const deposit = {
    amount: faker.datatype.number(1000),
    description: faker.lorem.words(3)
}
const withdraw = {
    amount: faker.datatype.number(deposit.amount),
    description: faker.lorem.words(3)
}

describe("Get balance controller", () => {
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

    it("Should be able to get a statement", async () => {
        const depositReponse = await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Bearer ${token}`)
            .send(deposit)

        const statementResponse = await request(app)
            .get(`/api/v1/statements/${depositReponse.body.id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(statementResponse.body).toMatchObject({
            ...depositReponse.body,
            amount: depositReponse.body.amount.toFixed(2)
        })
    })


})