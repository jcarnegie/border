import swagger from "../../lib/swagger";
export default async stage => {
    let spec = await swagger.build(stage);
    console.log(JSON.stringify(spec, null, 4)); // eslint-disable-line
};
