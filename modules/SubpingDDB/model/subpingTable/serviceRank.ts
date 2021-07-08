import DefaultModel from "./default";

interface ServiceRankModel extends DefaultModel{
  rank : number;
  time : string;
  serviceName: string;
  serviceSummary: string;
  serviceSquareLogoUrl: string;
  ttl: string;
}

export default ServiceRankModel