import { hash } from "bcryptjs";
import faker from "faker"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;
describe("Create user", ()=>{
    beforeEach(()=>{
        usersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepository);
    })
    it("Should be able to create an user", async ()=>{
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const createdUser = await createUserUseCase.execute(user);
        expect(createdUser).toMatchObject({
           name: user.name,
           email: user.email
        });
        expect(createdUser).toHaveProperty("id")
    })
    it("Should not to be able to create an user with an email already registered", async()=>{
        const user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
        const createdUser = await createUserUseCase.execute(user);
        await expect(createUserUseCase.execute(user)).rejects.toBeInstanceOf(CreateUserError)
    })
})