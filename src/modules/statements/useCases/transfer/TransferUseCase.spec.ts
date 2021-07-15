import { User } from "../../../users/entities/User"
import { TransferUseCase } from "./TransferUseCase"
import faker, { fake } from 'faker'
import { OperationType, Statement } from "../../entities/Statement"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
let usersRepository: InMemoryUsersRepository
let statementRepository: InMemoryStatementsRepository
let transferUseCase: TransferUseCase

let sender: User
let receiver: User

let sender_initial_statement: Statement

describe("Transfer usecase", ()=>{
    beforeAll(async ()=>{
        usersRepository = new InMemoryUsersRepository()
        statementRepository = new InMemoryStatementsRepository()
        transferUseCase = new TransferUseCase(usersRepository, statementRepository)

    })
    beforeEach(async ()=>{
        sender = await usersRepository.create({
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        })
        sender_initial_statement = await statementRepository.create({
            user_id: sender.id as string,
            amount: faker.datatype.number(),
            description: faker.lorem.words(6),
            type: 'deposit' as OperationType
        })

        receiver = await usersRepository.create({
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        })

    })
    it("should be able to make transfer", async ()=>{
        const amount = faker.datatype.number(sender_initial_statement.amount)
        const description = faker.lorem.words(6)
        const result = await transferUseCase.execute({
            sender_id: sender.id as string, 
            receiver_id: receiver.id as string,
            amount,
            description
        })
        expect(result).toMatchObject({
            amount,
            description,
            type: "transfer",
            user_id: receiver.id,
            sender_id: sender.id
        })
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('created_at')
        expect(result).toHaveProperty('updated_at')
    })
})