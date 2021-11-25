import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let userInMemoryRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeAll(() => {
    userInMemoryRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userInMemoryRepository);
  });

  it("Shoud be able to create new user", async () => {
    const password = "1234";
    const user = await createUserUseCase.execute({
      name: "user name test",
      email: "email@test.com.br",
      password,
    });

    const verifyPassword = await compare(password, user.password);

    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(verifyPassword).toBe(true);
  });

  it("Shoud not be able to create a new user with a duplicate email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "user name test",
        email: "email@test.com.br",
        password: "1234",
      });

      await createUserUseCase.execute({
        name: "user name test 2",
        email: "email@test.com.br",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
