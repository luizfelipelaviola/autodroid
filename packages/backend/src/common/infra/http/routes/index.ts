import { Router } from 'express'

import { authenticationMiddleware } from '@modules/user/infra/http/middlewares/authentication.middleware'

import { userRouter } from '@modules/user/infra/http/routes/user.routes'
import { datasetRouter } from '@modules/dataset/infra/http/routes/dataset.routes'
import { processingRouter } from '@modules/processing/infra/http/routes/processing.routes'
import { processorRouter } from '@modules/processor/http/routes/processor.routes'

const router = Router()

router.use('/health', (req, res) => res.status(200).json({ status: 'ok' }))

router.use('/user', userRouter)
router.use('/processor', processorRouter)

router.use(authenticationMiddleware)
router.use('/dataset', datasetRouter)
router.use('/processing', processingRouter)

export { router }
