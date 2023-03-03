import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'
import morgan from 'morgan'

//db abd authenticator
import connectDB from './db/connect.js'

//routers
import authRouter from './routes/authRoutes.js'
import jobsRouter from './routes/jobsRoutes.js'

//Middleware Imports
import errorHandlerMiddleware from './middleware/error-handler.js'
import notFoundMiddleware from './middleware/not-found.js'
import authenticateUser from './middleware/auth.js'

//imports to get current directory path
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

//import security libraries
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

//
if(process.env.NODE_ENV != 'production') {
    app.use(morgan('dev'))
}
// to get current directory path
const __dirname = dirname(fileURLToPath(import.meta.url))

// only use when ready to deploy on production env - to consume production ready frontend static assets form client/build folder
//app.use(express.static(path.resolve(__dirname, './client/build')))

app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

if(process.env.NODE_ENV == 'production') {
    // only use when ready to deploy on production env - to consume production ready frontend static assets form client/build folder
    app.use(express.static(path.resolve(__dirname, './client/build')))
    // only when ready to deploy on production env
    app.get('*', function (request, response) {
        response.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
    })
}

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)




const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()