import Iamport from "iamport";
import * as moment from "moment";

class Payment {
    iamport = Iamport({
        impKey: "5350926902723477",
        impSecret: "EtuTdCQJ0lKWBlTHzFWW7IH5M1inQWcvpGoDiemjA7fcs9U2OQYVyG1lHjJyfW4FCsiVHFeiMtvfDphr"
    });

    static calcNextPaymentDate(period: string, paymentDate: string) {
        const currentDate = moment(paymentDate);
        let nextDate: moment.Moment;

        switch(period) {
            case "1M":
                nextDate = currentDate.add(1, "month");
                break;

            case "2M":
                nextDate = currentDate.add(2, "month");
                break;

            case "3M":
                nextDate = currentDate.add(3, "month");
                break;

            case "1W":
                nextDate = currentDate.add(1, "week");
                break;

            case "2W":
                nextDate = currentDate.add(2, "week");
                break;

            case "3W":
                nextDate = currentDate.add(3, "week");
                break;

            default:
                throw Error(`[Payment calcNextPaymentDate] 주기가 잘못 입력되었습니다. 입력 값 : "${period}`)
        }

        return nextDate.format("YYYY-MM-DD");
    }

    async pay(name: string, cardId: string, marchantId: string, amount: number) {
        return await this.iamport.subscribe.again({
            name: name,
            customer_uid: cardId,
            merchant_uid: marchantId,
            amount: amount
        });
    }
}

export default Payment;