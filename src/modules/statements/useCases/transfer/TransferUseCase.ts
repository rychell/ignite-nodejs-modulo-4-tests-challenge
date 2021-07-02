import { inject } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { AppError } from '../../../../shared/errors/AppError';
import { OperationType } from "../../entities/Statement";

interface IRequest {
    sender_id: string
    receiver_id: string
    amount: number
    description: string
}
class TransferUseCase {
    constructor (
        @inject("UsersRepository")
        private usersRepository: IUsersRepository,
        @inject("StatementsRepository")
        private statementRepository: IStatementsRepository
    ){}
    async execute({sender_id, receiver_id, amount, description}: IRequest){
        const receiver = this.usersRepository.findById(receiver_id)
        if(!receiver){
            throw new AppError("Receiver user does not exists")
        }

        const sender = this.usersRepository.findById(sender_id)
        if(!sender){
            throw new AppError("Sender user does not exists")
        }
        const senderBalance = await this.statementRepository.getUserBalance({user_id: sender_id})

        const hasEnoughFunds = amount <= senderBalance.balance
        if(!hasEnoughFunds){
            throw new AppError("Sender has not enough funds to make this transfer")
        }

        await this.statementRepository.create(
            {
                type: "transfer"  as OperationType,
                user_id: sender_id,
                amount,
                description,
            }
        )
        return await this.statementRepository.create(
            {
                type: "transfer" as OperationType,
                user_id: receiver_id,
                sender_id,
                amount,
                description,
            }
        )

    }
}

export { TransferUseCase }  