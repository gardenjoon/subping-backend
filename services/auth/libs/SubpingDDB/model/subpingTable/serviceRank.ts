import DefaultModel from "./default";

interface ServiceRankModel extends DefaultModel{
  rank : number;
  time : string;
  serviceCode: string;
  serviceCategory: string;
  serviceName: string;
  serviceSummary: string;
  serviceSquareLogoUrl: string;
  serviceTags: string[];
  ttl: string;
}

export default ServiceRankModel