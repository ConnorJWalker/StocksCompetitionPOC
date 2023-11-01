import { Router } from 'express'
import InstrumentController from '../controllers/instrument-controller'

const router = Router()

router.get('/search/:searchTerm', InstrumentController.SearchInstruments)

router.get('/chart/:instrumentId', InstrumentController.GetInstrumentChart)

router.get('/data/:instrumentId', InstrumentController.GetCompanyData)

router.get('/users/:instrumentId', InstrumentController.GetOwningUsers)

export default router