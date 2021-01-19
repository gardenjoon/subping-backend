import DefaultModel from "./default"

interface ServiceModel extends DefaultModel {
    serviceCode: string;
    serviceName: string;
    serviceLogoUrl: string;
    servicSummary: string;
    serviceTags: string[];
    serviceCategory: String;
}


export default ServiceModel