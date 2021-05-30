import faker from 'faker'
import { User } from '../../../users/entities/User'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase'
import { OperationType } from '../../entities/Statement'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase'
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO'
import { GetBalanceError } from './GetBalanceError'
import { GetBalanceUseCase } from './GetBalanceUseCase'

let usersRepository: InMemoryUsersRepository
let statementsRepository: InMemoryStatementsRepository

let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getBalanceUseCase: GetBalanceUseCase

let user: User

let depositStament: ICreateStatementDTO
let withdrawStament: ICreateStatementDTO

describe("Get balance usecase", () => {
    beforeAll(async () => {
        usersRepository = new InMemoryUsersRepository()
        statementsRepository = new InMemoryStatementsRepository()

        createUserUseCase = new CreateUserUseCase(usersRepository)
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
        getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)

        user = await createUserUseCase.execute({
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        })
    })
    beforeEach(async () => {
        depositStament = {
            user_id: user.id as string,
            type: 'deposit' as OperationType,
            amount: faker.datatype.number(),
            description: faker.lorem.words(3)
        }
        withdrawStament = {
            user_id: user.id as string,
            type: 'withdraw' as OperationType,
            amount: faker.datatype.number(depositStament.amount),
            description: faker.lorem.words(3)
        }
        await createStatementUseCase.execute(depositStament)
        await createStatementUseCase.execute(withdrawStament)
    })
    it("Should be able to get balance for a given user", async () => {
        const balanceResponse = await getBalanceUseCase.execute({
            user_id: user.id as string
        })
        const calculatedBalance = depositStament.amount-withdrawStament.amount
        expect(balanceResponse).toMatchObject({
            statement:[depositStament, withdrawStament],
            balance: calculatedBalance
        })
    })

    it("Should not be able to get balance for a non existent user", async()=>{
        await expect(getBalanceUseCase.execute({
            user_id: faker.datatype.uuid()
        })).rejects.toBeInstanceOf(GetBalanceError)
    })
})