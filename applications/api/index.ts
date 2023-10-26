import 'dotenv/config'
import * as https from 'https'
import * as fs from 'fs'
import * as express from 'express'
import { Application, Request, Response, NextFunction } from 'express'
import * as cors from 'cors'
import 'express-async-errors'
import './middleware/passport'
import routes from './routes'

const app: Application = express()

const corsSettings = {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: '*'
}

app.use(cors(corsSettings))

app.use(express.json())
app.use(routes)

app.options('*', cors(corsSettings))

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error, try again later' })
})

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(process.env.PORT)