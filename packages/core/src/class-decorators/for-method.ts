export function withTiming<This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
): (this: This, ...args: Args) => Return {
    function replacement(this: This, ...args: Args): Return {
        const fullname = `${(this as any).constructor.name}.${String(context.name)}()`;
        const startTime = new Date();
        const logTime = (err?: any) => {
            const time = (new Date()).valueOf() - startTime.valueOf();
            if (err == null)
                log.trace(`Timing: Exiting method '${fullname}'. Time cost: ${time}ms`);
            else
                log.error(`Timing: Error in method '${fullname}'. Time cost: ${time}ms. ${err}`);
        };

        log.trace(`Timing: Entering method '${fullname}'. Arguments:`, args);
        try {
            const result = target.call(this, ...args);
            if (result instanceof Promise) {
                return result
                    .then(res => {
                        logTime();
                        return res;
                    })
                    .catch(err => {
                        logTime(err);
                        throw err;
                    }) as Return;
            } else {
                logTime();
                return result;
            }
        } catch (error) {
            logTime(error);
            throw error;
        }
    }

    return replacement;
}
