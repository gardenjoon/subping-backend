import DefaultModel from "./default"

interface ServiceModel extends DefaultModel {
    serviceCode: string;
    serviceName: string;
    serviceSquareLogoUrl: string;
    serviceSummary: string;
    serviceTags: string[];
    serviceCategory: string;
}

export default ServiceModel