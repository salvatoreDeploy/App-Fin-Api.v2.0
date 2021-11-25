import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user: User;
let user_id: string;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    user = await usersRepositoryInMemory.create({
      name: "user name",
      email: "user email",
      password: "1234",
    });

    user_id = user.id as string;
  });

  it("Should be able to get statement operation", async () => {
    const statement = await statementsRepositoryInMemory.create({
      user_id,
      amount: 500,
      description: "statement description",
      type: "deposit" as OperationType,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id: statement.id as string,
    });
    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation.amount).toBe(500);
    expect(statementOperation.type).toBe("deposit");
  });

  it("Should not be able to get statement operatiuon with invalid statement id", () => {
    expect(async () => {
      const statement = await statementsRepositoryInMemory.create({
        user_id,
        amount: 500,
        description: "statement description",
        type: "deposit" as OperationType,
      });
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "Invalid ID",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
