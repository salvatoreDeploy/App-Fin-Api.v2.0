import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUserRepository
    );
  });

  it("Should be able to authenticate a user", async () => {
    await createUserUseCase.execute({
      name: "User Name Test ",
      email: "email@test.com.br",
      password: "1234",
    });

    const tokenReturn = await authenticateUserUseCase.execute({
      email: "email@test.com.br",
      password: "1234",
    });

    expect(tokenReturn).toHaveProperty("token");
    expect(tokenReturn.user).toHaveProperty("id");
  });

  it("Should not be able to authenticate a user with incorrect password", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name Test ",
        email: "email@test.com.br",
        password: "1234",
      });

      await authenticateUserUseCase.execute({
        email: "email@test.com.br",
        password: "passwordInvalid",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
