// controllers/default/messages.controller.js
module.exports = {
    success: (data, res, status = 200) => {
        res.status(status).json({
            error: false,
            status: status,
            body: data
        });
    },
    error: (error, res, status = 500) => {
        // If error is an object with message and status, use that
        if (typeof error === 'object' && error !== null && error.message && error.status) {
            res.status(error.status).json({
                error: true,
                status: error.status,
                body: error.message,
                details: error.errors // For validation errors or other details
            });
        } 
        // If error is an Error object, use its message
        else if (error instanceof Error) {
            res.status(status).json({
                error: true,
                status: status,
                body: error.message
            });
        } 
        // If error is a string, use it as the message
        else if (typeof error === 'string') {
            res.status(status).json({
                error: true,
                status: status,
                body: error
            });
        } 
        // Fallback for other types of errors
        else {
            res.status(status).json({
                error: true,
                status: status,
                body: 'An unexpected error occurred.'
            });
        }
    }
};
