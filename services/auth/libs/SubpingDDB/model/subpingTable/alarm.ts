import DefaultModel from "./default";

type AlarmType = "delivery" | "payment" | "expiration" | "info" | "important";

interface AlarmModel extends DefaultModel {
    read: boolean,
    type: AlarmType,
    title: string,
    content: string,
    clickTo: string | null
}

export default AlarmModel;