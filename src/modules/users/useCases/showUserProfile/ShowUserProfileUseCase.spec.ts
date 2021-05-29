import faker from 'faker'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../createUser/CreateUserUseCase'
import { ShowUserProfileError } from './ShowUserProfileError'
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase'

let usersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

describe("Show user profile", ()=>{
    beforeEach(()=>{
        usersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(usersRepository)
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
    })
    it("Should be able to show user profile", async ()=>{
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const createdUser = await createUserUseCase.execute(user)

        const userProfile = await showUserProfileUseCase.execute(createdUser.id as string)

        expect(userProfile).toMatchObject({
            name: user.name,
            email: user.email
        })
    })
    it("Should not be able to show user profile if users does not exist", async ()=>{

        const userId = faker.random.alphaNumeric()

        await expect(showUserProfileUseCase.execute(userId)).rejects.toBeInstanceOf(ShowUserProfileError)
    })
})