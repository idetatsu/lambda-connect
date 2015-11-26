import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import wrapMiddleware from "wrap-middleware";

describe("wrapMiddleware", () => {

    describe("wraps the provided middleware in a function that", () => {

        const context = {contextKey: "contextValue"};
        const input = {inputKey: "inputValue"};
        const output = {outputKey: "outputValue"};

        it("logs the input and output of the function", () => {
            const log = {
                debug: sinon.spy()
            };
            const middleware = function middlewareName () {
                return output;
            };
            const wrappedMiddleware = wrapMiddleware(log, middleware);
            return wrappedMiddleware.call(context, input)
                .then(() => {
                    expect(log.debug).to.have.been.calledWith(
                        {middleware: "middlewareName", input, context},
                        "MiddlewareBefore"
                    );
                    expect(log.debug).to.have.been.calledWith(
                        {middleware: "middlewareName", output, context},
                        "MiddlewareAfter"
                    );
                });
        });

        it("transparently wraps the middleware", () => {
            const log = {
                debug: sinon.spy()
            };
            const middleware = sinon.spy(function middlewareName () {
                return output;
            });
            const wrappedMiddleware = wrapMiddleware(log, middleware);
            return wrappedMiddleware.call(context, input)
                .then(result => {
                    expect(middleware).to.have.been.calledOn(context);
                    expect(middleware.getCall(0).args[0]).to.equal(input);
                    expect(result).to.equal(output);
                });
        });

    });

});
