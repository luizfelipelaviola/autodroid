import { Router } from 'express'

import processingController from '../controllers/processing.controller'
import {
  Segments,
  validationMiddleware,
} from '@common/infra/http/middlewares/validation.middleware'
import { UserProcessingCreateSchema } from '@modules/processing/schemas/userProcessing.schema'
import processingFilesController from '../controllers/processingFiles.controller'

const processingRouter = Router()

processingRouter.post(
  '/',
  validationMiddleware({
    segment: Segments.BODY,
    schema: UserProcessingCreateSchema,
  }),
  processingController.create,
)
processingRouter.get('/', processingController.index)
processingRouter.get('/:processing_id', processingController.show)
processingRouter.use(
  '/:processing_id/download/*',
  processingFilesController.show,
)
processingRouter.delete('/:processing_id', processingController.delete)

export { processingRouter }
