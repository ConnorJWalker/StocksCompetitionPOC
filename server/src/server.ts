import * as express from 'express'
import { Application, Request, Response, NextFunction } from 'express'
import * as cors from 'cors'
import 'express-async-errors'
import 'dotenv/config'
import './config/passport'
import routes from './routes'

const app: Application = express()

const corsSettings = {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: '*',
}

app.use(cors(corsSettings))

app.use(express.json())
app.use(routes)

app.options('*', cors(corsSettings))

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error, try again later' })
})

app.listen(process.env.PORT)
