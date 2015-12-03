exports.handler = function(event, context) {
    // SUCCESS with message
    context.done(null, {
        context,
        event,
        Hello: context.name
    });
};
