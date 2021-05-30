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

        await request(app)
            .post("/api/v1/statements/deposit")
            .set('Authorization', `Bearer ${token}`)
            .send(deposit)


        await request(app)
            .post("/api/v1/statements/withdraw")
            .set('Authorization', `Bearer ${token}`)
            .send(withdraw)
    })
    afterAll(async () => {
        await clearDatabase()
        await connection.close()
    })
 
    it("Should be able to get balance", async () => {
        const response = await request(app)
            .get('/api/v1/statements/balance')    
            .set('Authorization', `Bearer ${token}`)
        
        expect(response.body).toMatchObject({
            statement:[deposit, withdraw],
            balance: deposit.amount - withdraw.amount
        })
    })

    
})