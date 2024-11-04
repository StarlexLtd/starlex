export function LOG<Fn extends (...args: any[]) => any>(
    target: Fn,
    context: ClassMethodDecoratorContext<ThisParameterType<Fn>, Fn>
) {
    function replacement(this: ThisParameterType<Fn>, ...args: Parameters<Fn>[]): ReturnType<Fn> {
        const fullname = `${(this as any).constructor.name}.${String(context.name)}()`;
        const startTime = new Date();
        const logTime = (err?: any) => {
            const time = (new Date()).valueOf() - startTime.valueOf();
            if (err == null)
                log.trace(`LOG: Exiting method '${fullname}'. Time cost: ${time}ms`);
            else
                log.error(`LOG: Error in method '${fullname}'. Time cost: ${time}ms. ${err}`);
        };

        log.trace(`LOG: Entering method '${fullname}'. Arguments:`, args);
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
                    }) as ReturnType<Fn>;
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
