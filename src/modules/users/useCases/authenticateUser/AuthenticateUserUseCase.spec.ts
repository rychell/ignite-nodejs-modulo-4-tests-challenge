import faker from 'faker'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../createUser/CreateUserUseCase'
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase'
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError'

let usersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase:  AuthenticateUserUseCase

describe("Autenticate user", ()=>{
    beforeEach(()=>{
        usersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(usersRepository)
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
    })
    it("Should be able to authenticate an user", async()=>{
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }

        await createUserUseCase.execute(user)

        const authenticatedUser = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        })

        expect(authenticatedUser).toHaveProperty("token")
        expect(authenticatedUser).toMatchObject({
            user:{
                name: user.name,
                email: user.email
            }
        })
    })
    it("Should not be able to authenticate with an unexistent user", async ()=>{
        const user = {
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        await expect(authenticateUserUseCase.execute(user)).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })
    it("Should not be able to authenticate using wrong password", async ()=>{
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        await createUserUseCase.execute(user)
        await expect(authenticateUserUseCase.execute({
            email: user.email,
            password: "wrongpassword"
        })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })
})