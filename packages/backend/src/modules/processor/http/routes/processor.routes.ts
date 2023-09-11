import { Router } from 'express'

import processorController from '../controllers/processor.controller'

const processorRouter = Router()

processorRouter.get('/', processorController.index)
processorRouter.get('/:processor_code', processorController.show)

export { processorRouter }
