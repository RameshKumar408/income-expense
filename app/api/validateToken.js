const jwt = require('jsonwebtoken');
export async function validateToken(params) {
    try {
        if (params) {
            var decodes = jwt.decode(params)
            return { success: true, user: decodes }
        } else {
            return { success: false, user: null }
        }
    } catch (error) {
        console.log("🚀 ~ validateToken ~ error:", error)
        return { success: false, user: null }
    }

}