import * as express from 'express'
import { Application } from 'express'
import 'dotenv/config'
import './config/passport'
import routes from './routes'

const app: Application = express()

app.use(express.json())
app.use(routes)

app.listen(process.env.PORT)
