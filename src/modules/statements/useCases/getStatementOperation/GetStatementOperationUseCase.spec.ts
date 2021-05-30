import faker, { fake } from 'faker'
import { User } from '../../../users/entities/User'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase'
import { OperationType } from '../../entities/Statement'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase'
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO'
import { GetStatementOperationError } from './GetStatementOperationError'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'

let usersRepository: InMemoryUsersRepository
let statementsRepository: InMemoryStatementsRepository

let createUserUseCase : CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase : GetStatementOperationUseCase

let createdUser : User
describe("GetStatementOperation", ()=>{
    beforeAll(async ()=>{
        usersRepository = new InMemoryUsersRepository()
        statementsRepository = new InMemoryStatementsRepository()

        createUserUseCase = new CreateUserUseCase(usersRepository)
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)

        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        
        createdUser = await createUserUseCase.execute(user)
    })

    it("Should be able to get a statement operation", async ()=>{
        const statement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: 'deposit' as OperationType,
            amount: faker.datatype.number(),
            description: faker.lorem.words(3)
        }
        const createdStatement = await createStatementUseCase.execute(statement)

        const getStamentResult = await getStatementOperationUseCase.execute({
            user_id: createdUser.id as string,
            statement_id: createdStatement.id as string
        })

        expect(getStamentResult).toMatchObject(createdStatement)
    })

    it("Should not be able to get a statement operation to an id that doesn't exists", async()=>{
        await expect(getStatementOperationUseCase.execute({
            user_id: createdUser.id as string,
            statement_id: faker.datatype.uuid()
        })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    })
    it("Should not be able to get a statement operation to an id that doesn't exists", async()=>{
        await expect(getStatementOperationUseCase.execute({
            user_id: faker.datatype.uuid(),
            statement_id: faker.datatype.uuid()
        })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    })
})