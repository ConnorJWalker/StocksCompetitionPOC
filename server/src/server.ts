import * as express from 'express'
import { Application, Request, Response, NextFunction } from 'express'
import 'express-async-errors'
import 'dotenv/config'
import './config/passport'
import routes from './routes'

const app: Application = express()

app.use(express.json())
app.use(routes)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error, try again later' })
})

app.listen(process.env.PORT)
