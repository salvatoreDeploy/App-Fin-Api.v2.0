import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let create;
let user_id: string;
let user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    user = await usersRepositoryInMemory.create({
      name: "user name test",
      email: "email@test.com.br",
      password: "1234",
    });

    user_id = user.id as string;
  });

  it("Should be able to get balance", async () => {
    await statementsRepositoryInMemory.create({
      user_id,
      amount: 500,
      description: "statement description",
      type: "deposit" as OperationType,
    });

    const balanceReturn = await getBalanceUseCase.execute({ user_id });

    expect(balanceReturn).toHaveProperty("statement");
    expect(balanceReturn).toHaveProperty("balance");
    expect(balanceReturn.statement[0].user_id).toEqual(user_id);
    expect(balanceReturn.balance).toBe(500);
    expect(balanceReturn.statement[0].type).toEqual("deposit");
  });

  it("Should not be able to get balance from unexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "InvalidID" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  it("Should be able to calculate balance properly", async () => {
    const amount1 = 500;
    const amount2 = 100;
    const amount3 = 50;
    const amount4 = 1000;

    await statementsRepositoryInMemory.create({
      user_id,
      amount: amount1,
      description: "statement description",
      type: "deposit" as OperationType,
    });

    await statementsRepositoryInMemory.create({
      user_id,
      amount: amount2,
      description: "statement description",
      type: "withdraw" as OperationType,
    });

    await statementsRepositoryInMemory.create({
      user_id,
      amount: amount3,
      description: "statement description",
      type: "withdraw" as OperationType,
    });

    await statementsRepositoryInMemory.create({
      user_id,
      amount: amount4,
      description: "statement description",
      type: "deposit" as OperationType,
    });

    const total = amount1 - amount2 - amount3 + amount4;

    const balanceReturn = await getBalanceUseCase.execute({ user_id });

    expect(balanceReturn.balance).toBe(total);
  });
});
