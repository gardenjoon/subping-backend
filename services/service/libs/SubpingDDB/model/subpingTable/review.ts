import DefaultModel from "./default";

interface ReviewModel extends DefaultModel{
    service: string;
    author: string;
    imagesUrl: string[];
    title: string;
    content: string;
}

export default ReviewModel 