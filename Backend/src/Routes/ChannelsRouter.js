import express from 'express'

const channelRouter = express.Router({ mergeParams: true })

channelRouter.get(
    '/',
    (request, response) => {
        response.send({
            ok: true
            ,
            message: 'Channel'
        })
    }
)

export default channelRouter