import watcher from "./dev/watcher";

export default async (stage) => {
    await watcher.start(stage);
};
