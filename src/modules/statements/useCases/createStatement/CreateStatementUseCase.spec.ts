import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("Should be able to create a new deposit statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "user name",
      email: "user email",
      password: "1234",
    });

    const user_id = user.id as string;

    const statement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 500,
      description: "statement description",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(500);
    expect(statement.type).toEqual("deposit");
  });

  it("Should be able to create a new withidraw statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "user name",
      email: "user email",
      password: "1234",
    });

    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 500,
      description: "statement description",
    });

    const statement = await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 200,
      description: "statement description",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(200);
    expect(statement.type).toEqual("withdraw");
  });

  it("Should not be able to withdraw with insufficient funds", () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "user name",
        email: "user email",
        password: "1234",
      });

      const user_id = user.id as string;

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 200,
        description: "statement description",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
