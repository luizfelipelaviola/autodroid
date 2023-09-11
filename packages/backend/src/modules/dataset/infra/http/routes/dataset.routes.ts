import { Router } from 'express'

import datasetController from '../controllers/dataset.controller'
import datasetFileController from '../controllers/datasetFile.controller'
import {
  Segments,
  validationMiddleware,
} from '@common/infra/http/middlewares/validation.middleware'
import { UserDatasetUpdateSchema } from '@modules/dataset/schemas/userDataset.schema'

const datasetRouter = Router()

datasetRouter.post('/', datasetController.create)
datasetRouter.get('/', datasetController.index)
datasetRouter.get('/:dataset_id', datasetController.show)
datasetRouter.get('/:dataset_id/download', datasetFileController.show)
datasetRouter.put(
  '/:dataset_id',
  validationMiddleware({
    schema: UserDatasetUpdateSchema,
    segment: Segments.BODY,
  }),
  datasetController.update,
)
datasetRouter.delete('/:dataset_id', datasetController.delete)

export { datasetRouter }
