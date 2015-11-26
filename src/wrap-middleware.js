import {bind} from "bluebird";

export default function wrapMiddleware (log, middleware) {
    return function (input) {
        return bind(this, input)
            .then(function (input) {
                log.debug(
                    {middleware: middleware.name, input, context: this},
                    "MiddlewareBefore"
                );
                return input;
            })
            .then(middleware)
            .then(function (output) {
                log.debug(
                    {middleware: middleware.name, output, context: this},
                    "MiddlewareAfter"
                );
                return output;
            });
    };
}
