import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const createjwtToken = (user_id,name, email, role) => {
    const payload = { user_id,name, email, role }
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY_TIME
    })
    return jwtToken
}

export { createjwtToken }