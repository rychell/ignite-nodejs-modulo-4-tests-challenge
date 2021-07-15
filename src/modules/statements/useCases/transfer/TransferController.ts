import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferUseCase } from "./TransferUseCase";

class TransferController {
    async execute(request: Request, response: Response): Promise<Response>{
        const transferUseCase = container.resolve(TransferUseCase)
        const { id: sender_id} = request.user
        const {user_id: receiver_id} = request.params
        const { amount, description} = request.body

        const statement = await transferUseCase.execute({sender_id,receiver_id,amount,description})

        return response.status(201).json(statement)
    }
}
export {TransferController}