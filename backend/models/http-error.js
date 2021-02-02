class HttpError extends Error {
    constructor(messgae, errorCode)
    {
        super(messgae);
        this.code = errorCode;
    }
}

module.exports = HttpError;