import * as AWS from "aws-sdk";

export function call(action, params) {
  let dynamoDb = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true,
  });
  if (process.env.stage == "local") {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
      endpoint: process.env.dynamoLocalURL,
      convertEmptyValues: true,
    });
  }
  return dynamoDb[action](params).promise();
}

export async function queryAuth(uniqueId) {
  try {
    const params = {
      TableName: process.env.auths,
      KeyConditionExpression: "uniqueId = :uniqueId",
      ExpressionAttributeValues: {
        ":uniqueId": uniqueId,
      },
    };

    var results = (await call("query", params)).Items;
    return results;
  } catch (e) {
    throw new Error("D0000");
  }
}

export async function putAuth(item) {
  try {
    var params = {
      TableName: process.env.auths,
      Item: item,
    };

    await call("put", params);
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function updateAuth(uniqueId, item) {
  try {
    const keys = Object.keys(item);

    var expression = "SET ";
    var expressionItem = {};
    var expressionName = {};

    const keysLength = keys.length;

    for (let i = 0; i < keysLength; i++) {
      expressionItem[`:${keys[i]}`] = item[keys[i]];
      expressionName[`#${keys[i]}`] = `${keys[i]}`;
      expression = expression.concat(`#${keys[i]} = :${keys[i]}, `);
    }

    expressionItem[`:updatedAt`] = new Date().toISOString();
    expression = expression.concat(`updatedAt = :updatedAt`);

    const params = {
      TableName: process.env.auths,
      Key: {
        uniqueId: uniqueId,
      },
      UpdateExpression: expression,
      ExpressionAttributeNames: expressionName,
      ExpressionAttributeValues: expressionItem,
      ReturnValues: "ALL_NEW",
    };

    const result = (await call("update", params)).Attributes;

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function querySkIndex(SK) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      IndexName: "SK-PK-index",
      KeyConditionExpression: "SK = :SK",
      ExpressionAttributeValues: {
        ":SK": SK,
      },
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryEqual(PK, SK) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      KeyConditionExpression: "PK = :PK and SK = :SK",
      ExpressionAttributeValues: {
        ":PK": PK,
        ":SK": SK,
      },
      ScanIndexForward: false,
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryBetween(PK, min, max) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      KeyConditionExpression: "PK = :PK and SK between :min and :max",
      ExpressionAttributeValues: {
        ":PK": PK,
        ":min": min,
        ":max": max,
      },
      ScanIndexForward: false,
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryBeginsWith(PK, SK) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      KeyConditionExpression: "PK = :PK and begins_with(SK, :SK)",
      ExpressionAttributeValues: {
        ":PK": PK,
        ":SK": SK,
      },
      ScanIndexForward: false,
    };
    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");
    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryPK(PK) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: {
        ":PK": PK,
      },
      ScanIndexForward: false,
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryModel(model) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      IndexName: "model-PK-index",
      KeyConditionExpression: "model = :model",
      ExpressionAttributeValues: {
        ":model": model,
      },
      ScanIndexForward: false,
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryOptionsToContinue() {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      IndexName: "model-PK-index",
      KeyConditionExpression: "model = :model",
      FilterExpression: "continueAt between :startHour and :endHour ",
      ExpressionAttributeValues: {
        ":model": "option",
        ":startHour": moment().startOf("day").utc().format(),
        ":endHour": moment().endOf("day").utc().format(),
      },

      ScanIndexForward: false,
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function queryModelPK(model, PK) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      IndexName: "model-PK-index",
      KeyConditionExpression: "model = :model and PK = :PK",
      ExpressionAttributeValues: {
        ":model": model,
        ":PK": PK,
      },
      ScanIndexForward: false,
    };

    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function putTickle(item) {
  try {
    let params = {
      TableName: process.env.tickleTable,
      Item: item,
    };

    if (!item.createdAt) {
      params.Item.createdAt = new Date().toISOString();
    }
    if (!item.updatedAt) {
      params.Item.updatedAt = new Date().toISOString();
    }
    await call("put", params);
  } catch (err) {
    throw new ErrorHandler(err, "putTickle");
  }
}

export async function deleteTickle(item) {
  try {
    const params = {
      TableName: process.env.tickleTable,
      Key: item,
    };

    await call("delete", params);
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function updateTickle(PK, SK, item) {
  try {
    const keys = Object.keys(item);

    var expression = "SET ";
    var expressionItem = {};
    var expressionName = {};

    const keysLength = keys.length;

    for (let i = 0; i < keysLength; i++) {
      expressionItem[`:${keys[i]}`] = item[keys[i]];
      expressionName[`#${keys[i]}`] = `${keys[i]}`;
      expression = expression.concat(`#${keys[i]} = :${keys[i]}, `);
    }

    if (!item.updatedAt) {
      expressionItem[`:updatedAt`] = new Date().toISOString();
      expression = expression.concat(`updatedAt = :updatedAt`);
    } else {
      expression = expression.substring(0, expression.length - 2);
    }
    const params = {
      TableName: process.env.tickleTable,
      Key: {
        PK: PK,
        SK: SK,
      },
      UpdateExpression: expression,
      ExpressionAttributeNames: expressionName,
      ExpressionAttributeValues: expressionItem,
      ReturnValues: "ALL_NEW",
    };
    return (await call("update", params)).Attributes;
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

export async function atomicCounter(PK, SK, field, numb) {
  try {
    const tickleTable = "prod-tickle";
    const params = {
      TableName: tickleTable,
      Key: {
        PK: PK,
        SK: SK,
      },
      UpdateExpression: `SET ${field} = ${field} + :incr`,
      ExpressionAttributeValues: {
        ":incr": numb,
      },
      ReturnValues: "UPDATED_NEW",
    };
    return (await call("update", params)).Attributes;
  } catch (err) {
    throw new ErrorHandler(err, "ERR_INTERNAL_SERVER");
  }
}

export async function atomicCounterDynamicStage(PK, SK, field, numb) {
  try {
    const params = {
      TableName: process.env.tickleTable,
      Key: {
        PK: PK,
        SK: SK,
      },
      UpdateExpression: `SET ${field} = ${field} + :incr`,
      ExpressionAttributeValues: {
        ":incr": numb,
      },
      ReturnValues: "UPDATED_NEW",
    };
    return (await call("update", params)).Attributes;
  } catch (err) {
    throw new ErrorHandler(err, "ERR_INTERNAL_SERVER");
  }
}

export async function resetCounter(PK, SK, field, numb) {
  try {
    const params = {
      TableName: process.env.tickleTable,
      Key: {
        PK: PK,
        SK: SK,
      },
      UpdateExpression: `SET ${field} = :upd`,
      ExpressionAttributeValues: {
        ":upd": numb,
      },
      ReturnValues: "ALL_NEW",
    };
    return (await call("update", params)).Attributes;
  } catch (err) {
    throw new ErrorHandler(err, "ERR_INTERNAL_SERVER");
  }
}

export async function queryValidBanners(tab, appVersion, platform) {
  try {
    var results = [];

    const params = {
      TableName: process.env.tickleTable,
      KeyConditionExpression: "PK = :PK",
      FilterExpression:
        "tab = :tab and maxVersion > :appVersion and minVersion <= :appVersion and contains(platform,:platform) and endDate >= :endDate",
      ExpressionAttributeValues: {
        ":PK": "banner",
        ":appVersion": appVersion,
        ":tab": tab,
        ":platform": platform,
        ":endDate": moment()
          .tz("Asia/Seoul")
          .endOf("day")
          .format()
          .slice(0, 10),
      },
      ScanIndexForward: false,
    };
    do {
      var items = await call("query", params);
      items.Items.forEach((item) => results.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return results;
  } catch (err) {
    throw new ErrorHandler(err, "ERR_INTERNAL_SERVER");
  }
}

export async function batchWriteTickle(batches) {
  try {
    batches
      .map((item) => {
        let params = `{"RequestItems": {"${process.env.tickleTable}": []}}`;
        params = JSON.parse(params);
        params.RequestItems[process.env.tickleTable] = item;
        return params;
      })
      .forEach(async (item) => {
        await call("batchWrite", item);
      });
  } catch (e) {
    console.log(e);
    throw new Error("D0000");
  }
}

