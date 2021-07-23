export type TSubpingTableReadIndex = "PK-SK-Index" | "model-PK-Index" | "PK-createdAt-Index" | "PK-updatedAt-Index" | "SK-PK-Index"
export type TKeyTableReadIndex = "uniqueId-Index";
export type TAuthTableReadIndex = TKeyTableReadIndex
export type TCombinedAllReadIndex = TSubpingTableReadIndex | TKeyTableReadIndex