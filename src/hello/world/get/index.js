console.log("Loading event");

exports.handler = function(event, context) {
    // SUCCESS with message
    context.done(null, { Hello: "World" });
};
