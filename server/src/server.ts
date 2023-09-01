import * as express from 'express'
import { Application, Request, Response } from 'express'

const app: Application = express()

app.get('/', (req: Request, res: Response) => res.send('HE1HE1HE1'))

app.listen(3000)
