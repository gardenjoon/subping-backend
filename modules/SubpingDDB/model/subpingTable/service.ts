import DefaultModel from "./default"

interface ServiceModel extends DefaultModel {
    serviceCode: string;
    serviceName: string;
    serviceSqaureLogoUrl: string;
    servicSummary: string;
    serviceTags: string[];
    serviceRating: number;
    serviceMinPrice: number;
}


export default ServiceModel