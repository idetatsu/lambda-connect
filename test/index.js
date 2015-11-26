import chai, {expect} from "chai";
import {always, identity} from "ramda";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import {default as getHandler, LambdaConnect} from "index";
import RequestError from "request-error";

describe("LambdaConnect", () => {

    describe("use", () => {

        it("is chainable", () => {
            const lambdaConnect = new LambdaConnect();
            expect(lambdaConnect.use()).to.equal(lambdaConnect);
        });

    });

    describe("handler", () => {

        const lambdaContext = {
            succeed: sinon.spy(),
            fail: sinon.spy()
        };

        const log = {
            warn: sinon.spy(),
            info: sinon.spy(),
            debug: sinon.spy()
        };

        beforeEach(() => {
            lambdaContext.succeed.reset();
            lambdaContext.fail.reset();
            log.warn.reset();
            log.info.reset();
            log.debug.reset();
        });

        it("calls every middleware in sequence", () => {
            const lambdaConnect = new LambdaConnect({log});
            const middleware_0 = sinon.spy(identity);
            const middleware_1 = sinon.spy(identity);
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler({}, lambdaContext)
                .then(() => {
                    expect(middleware_0).to.have.been.calledBefore(middleware_1);
                    expect(middleware_0).to.have.been.calledBefore(middleware_2);
                    expect(middleware_1).to.have.been.calledBefore(middleware_2);
                });
        });

        it("calls every middleware with the correct input", () => {
            const lambdaConnect = new LambdaConnect({log});
            const request = {requestKey: "requestValue"};
            const output_0 = {output_0: "output_0"};
            const output_1 = {output_1: "output_1"};
            const middleware_0 = sinon.spy(always(output_0));
            const middleware_1 = sinon.spy(always(output_1));
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler(request, lambdaContext)
                .then(() => {
                    expect(middleware_0).to.have.been.calledWith(request);
                    expect(middleware_1).to.have.been.calledWith(output_0);
                    expect(middleware_2).to.have.been.calledWith(output_1);
                });
        });

        it("calls every middleware with the correct middleware context", () => {
            const middlewareContext = {middlewareContextKey: "middlewareContextValue"};
            const lambdaConnect = new LambdaConnect({log, middlewareContext});
            const request = {requestKey: "requestValue"};
            const output_0 = {output_0: "output_0"};
            const output_1 = {output_1: "output_1"};
            const middleware_0 = sinon.spy(always(output_0));
            const middleware_1 = sinon.spy(always(output_1));
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler(request, lambdaContext)
                .then(() => {
                    expect(middleware_0).to.have.been.calledOn(middlewareContext);
                    expect(middleware_1).to.have.been.calledOn(middlewareContext);
                    expect(middleware_2).to.have.been.calledOn(middlewareContext);
                });
        });

        it("calls `context.succeed` on success", () => {
            const lambdaConnect = new LambdaConnect({log});
            const request = {requestKey: "requestValue"};
            const output_0 = {output_0: "output_0"};
            const output_1 = {output_1: "output_1"};
            const middleware_0 = sinon.spy(always(output_0));
            const middleware_1 = sinon.spy(always(output_1));
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler(request, lambdaContext)
                .then(() => {
                    expect(lambdaContext.succeed).to.have.been.calledWith(output_1);
                    expect(lambdaContext.fail).to.have.callCount(0);
                });
        });

        it("calls `context.fail` on failure - RequestError", () => {
            const lambdaConnect = new LambdaConnect({log});
            const request = {requestKey: "requestValue"};
            const output_0 = {output_0: "output_0"};
            const error = new RequestError();
            const middleware_0 = sinon.spy(always(output_0));
            const middleware_1 = sinon.stub().throws(error);
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler(request, lambdaContext)
                .then(() => {
                    expect(lambdaContext.fail).to.have.been.calledWith(JSON.stringify(error));
                    expect(lambdaContext.succeed).to.have.callCount(0);
                });
        });

        it("calls `context.fail` on failure - generic Error", () => {
            const lambdaConnect = new LambdaConnect({log});
            const request = {requestKey: "requestValue"};
            const output_0 = {output_0: "output_0"};
            const error = new RequestError(500, "Internal server error");
            const genericError = new Error();
            const middleware_0 = sinon.spy(always(output_0));
            const middleware_1 = sinon.stub().throws(genericError);
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler(request, lambdaContext)
                .then(() => {
                    expect(lambdaContext.fail).to.have.been.calledWith(JSON.stringify(error));
                    expect(lambdaContext.succeed).to.have.callCount(0);
                });
        });

        it("interrupts the pipeline on failure", () => {
            const lambdaConnect = new LambdaConnect({log});
            const request = {requestKey: "requestValue"};
            const output_0 = {output_0: "output_0"};
            const genericError = new Error();
            const middleware_0 = sinon.spy(always(output_0));
            const middleware_1 = sinon.stub().throws(genericError);
            const middleware_2 = sinon.spy(identity);
            lambdaConnect.use(middleware_0);
            lambdaConnect.use(middleware_1);
            lambdaConnect.use(middleware_2);
            return lambdaConnect.handler(request, lambdaContext)
                .then(() => {
                    expect(middleware_2).to.have.callCount(0);
                });
        });

    });

});

describe("getHandler", () => {

    it("returns a function", () => {
        const handler = getHandler();
        expect(handler).to.be.a("function");
    });

    describe("the handler", () => {

        const lambdaContext = {
            succeed: sinon.spy(),
            fail: sinon.spy()
        };
        const log = {
            warn: sinon.spy(),
            info: sinon.spy(),
            debug: sinon.spy()
        };

        it("has a chainable `use` method", () => {
            const handler = getHandler();
            const ret = handler.use(identity);
            expect(ret).to.equal(handler);
        });

        it("just wraps the LambdaConnect class handler method (and has therefore the same behaviour)", () => {
            const middlewareContext = {middlewareContextKey: "middlewareContextValue"};
            const handler = getHandler({middlewareContext, log});
            const middleware_0 = sinon.spy(identity);
            const middleware_1 = sinon.spy(identity);
            const middleware_2 = sinon.spy(identity);
            handler.use(middleware_0);
            handler.use(middleware_1);
            handler.use(middleware_2);
            const request = {requestKey: "requestValue"};
            return handler(request, lambdaContext)
                .then(() => {
                    // Order
                    expect(middleware_0).to.have.been.calledBefore(middleware_1);
                    expect(middleware_0).to.have.been.calledBefore(middleware_2);
                    expect(middleware_1).to.have.been.calledBefore(middleware_2);
                    // Input
                    expect(middleware_0).to.have.been.calledWith(request);
                    expect(middleware_1).to.have.been.calledWith(request);
                    expect(middleware_2).to.have.been.calledWith(request);
                    // Context
                    expect(middleware_0).to.have.been.calledOn(middlewareContext);
                    expect(middleware_1).to.have.been.calledOn(middlewareContext);
                    expect(middleware_2).to.have.been.calledOn(middlewareContext);
                });
        });

    });

});
