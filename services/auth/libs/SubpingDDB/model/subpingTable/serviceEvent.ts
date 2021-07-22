import DefaultModel from "./default";

interface ServiceEventModel extends DefaultModel{
    serviceCode: string;
    dailySubscribers: number;
    dailyReviews: number;
    dailyWatchers: number;
}

export default ServiceEventModel