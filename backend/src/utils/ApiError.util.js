class ApiError extends Error {
    constructor(
        statusCode,
        message,
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

        toJSON:() => {
            return {
                statusCode: this.statusCode,
                message: this.message,
                success: this.success,
                errors: this.errors,
                stack: this.stack
            };
        }
    }
}

export {ApiError};