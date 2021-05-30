import faker from 'faker'
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from './CreateStatementError'
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from "./ICreateStatementDTO"

let usersRepository: InMemoryUsersRepository
let statementRepository: InMemoryStatementsRepository

let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe("Create statement", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        statementRepository = new InMemoryStatementsRepository()

        createUserUseCase = new CreateUserUseCase(usersRepository)
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementRepository)
    })
    it("Should be able to create an deposit statement", async () => {
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const createdUser = await createUserUseCase.execute(user)

        const statement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: 'deposit' as OperationType,
            amount: faker.datatype.number(),
            description: faker.lorem.words(3)
        }
        const createdStatement = await createStatementUseCase.execute(statement)
        expect(createdStatement).toHaveProperty("id")
    })
    it("Should be able to create an withdraw statement", async () => {
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const createdUser = await createUserUseCase.execute(user)

        const depositStatement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: 'deposit' as OperationType,
            amount: faker.datatype.number(),
            description: faker.lorem.words(3)
        }
        await createStatementUseCase.execute(depositStatement)

        const withdrawStatement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: 'withdraw' as OperationType,
            amount: faker.datatype.number(depositStatement.amount),
            description: faker.lorem.words(3)
        }
        const createdWithdrawStatement = await createStatementUseCase.execute(withdrawStatement)


        expect(createdWithdrawStatement).toHaveProperty("id")
    })

    it("Should not be able to create an withdraw statement with amout greater than account balance", async () => {
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const createdUser = await createUserUseCase.execute(user)

        const depositStatement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: 'deposit' as OperationType,
            amount: faker.datatype.number(),
            description: faker.lorem.words(3)
        }
        await createStatementUseCase.execute(depositStatement)

        const withdrawStatement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: 'withdraw' as OperationType,
            amount: depositStatement.amount + faker.datatype.number(),
            description: faker.lorem.words(3)
        }

        await expect(createStatementUseCase.execute(withdrawStatement)).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    })
    it("Should not be able to create an deposit statement for an user that doesn't exists", async () => {
        const statement: ICreateStatementDTO = {
            user_id: faker.datatype.uuid(),
            type: 'deposit' as OperationType,
            amount: faker.datatype.number(),
            description: faker.lorem.words(3)
        }
        
        await expect(createStatementUseCase.execute(statement)).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    })
})