import {bind} from "bluebird";
import {is, pipeP} from "ramda";
import bunyan from "bunyan";

import RequestError from "./request-error";
import wrapMiddleware from "./wrap-middleware";

export class LambdaConnect {

    constructor (options = {}) {
        this.middlewareContext = options.middlewareContext || null;
        this.log = options.log || bunyan.createLogger({name: "lambda-connect"});
        this.pipelineSteps = [];
    }

    use (middleware) {
        this.pipelineSteps.push(wrapMiddleware(this.log, middleware));
        return this;
    }

    handler (request, lambdaContext) {
        this.log.info({request}, "Request");
        return bind(this.middlewareContext, request)
            .then(pipeP(...this.pipelineSteps))
            .then(response => {
                this.log.info({response}, "Succeed");
                lambdaContext.succeed(response);
            })
            .catch(error => {
                if (!is(RequestError, error)) {
                    this.log.warn(error, "Unexpected error");
                    error = new RequestError(500, "Internal server error");
                }
                this.log.info(error, "Fail");
                lambdaContext.fail(JSON.stringify(error));
            });
    }

}

export default function getHandler (/* arguments */) {
    const lambdaConnect = new LambdaConnect(...arguments);
    const handler = ::lambdaConnect.handler;
    handler.use = (middleware) => {
        lambdaConnect.use(middleware);
        return handler;
    };
    return handler;
}
