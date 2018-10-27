'use strict';
// Onaje Baxley
// 4/26/18

const Promise = require('bluebird').Promise;
const _awsSdk = require('aws-sdk');
const _awsDynamoDb = require('aws-dynamodb');

const table = 'demographics';
const config = { region: 'us-east-1', endpoint: 'http://dynamodb.us-east-1.amazonaws.com', accessKeyId: process.env.accessKeyId, secretAccessKey: process.env.secretAccessKey };

/**
 * Retrieves all demographics statistics on file.
 */
function getAllDemographics() {
  return new Promise((resolve, reject) => {
    const dynamoDbClient = _awsDynamoDb(new _awsSdk.DynamoDB(config));

    dynamoDbClient.table(table).scan((err, data) => {
      if (err) {
        console.error('Data access error', JSON.stringify(err, null, 2));
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
}

/**
 * Retrieves the demographics information for the speicifc zip code provided.
 *
 * @param zipCode Number representing the zip code for which to grab demographics info
 */
function getDemographicsByZipCode(zipCode) {
  return new Promise((resolve, reject) => {
    if (!zipCode || !parseInt(zipCode.toString(), 10)) {
      console.error('Unable to parse zip code. Please provide a numeric zip code.');
      return reject(false);
    }

    zipCode = parseInt(zipCode.toString(), 10);
    const dynamoDbClient = _awsDynamoDb(new _awsSdk.DynamoDB(config));

    dynamoDbClient.table(table).where('zip_code').eq(zipCode).query((err, data) => {
      if (err) {
        console.error('Data access error', JSON.stringify(err, null, 2));
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
}

/**
 * Creates a new record of demographics information for the given (required) zip code jurisdiction and participants.
 *
 * @param zipCode Number
 * @param numParticipants Number
 * @param other Object
 */
function createDemographics(zipCode, numParticipants, other) {
  return new Promise((resolve, reject) => {
    if ( !zipCode || !numParticipants || !parseInt(zipCode.toString(), 10) || !parseInt(numParticipants.toString(), 10) ) {
      console.error('Unable to parse argument(s)');
      return reject(false);
    }

    const dynamoDbClient = _awsDynamoDb(new _awsSdk.DynamoDB(config));
    var newRecord;
    if (!other) {
      newRecord = { zip_code: parseInt(zipCode.toString(), 10), num_participants: parseInt(numParticipants.toString(), 10) };
    } else {
      newRecord = other;
      newRecord.zip_code = parseInt(zipCode.toString(), 10);
      newRecord.num_participants = parseInt(numParticipants.toString(), 10);
    }

    dynamoDbClient.table(table).insert(newRecord, (err, data) => {
      if (err) {
        console.error('Data access error', JSON.stringify(err, null, 2));
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
}

/**
 * Updates the demographics statistic record identified by the given numeric zip code.
 *
 * @param zipCode Number indicating the specifc zip code jurisdiction to update
 * @param newValues Object containing the additional fields to be inserted/updated
 */
function updateDemographics(zipCode, newValues) {
  return new Promise((resolve, reject) => {
    if ( !zipCode || !newValues || !newValues.num_participants || !parseInt(zipCode.toString(), 10) || !parseInt(newValues.num_participants.toString(), 10) ) {
      console.error('Unable to parse argument(s)');
      reject(false);
    }
    zipCode = parseInt(zipCode.toString(), 10);

    const dynamoDbClient = _awsDynamoDb(new _awsSdk.DynamoDB(config));
    var newOrExistingRecord = newValues;
    newOrExistingRecord.zip_code = zipCode;
    newOrExistingRecord.num_participants = parseInt(newValues.num_participants.toString(), 10);
    
    dynamoDbClient.table(table).where('zip_code').eq(zipCode)
    .return(dynamoDbClient.UPDATED_OLD).insert_or_update(newOrExistingRecord, (err, data) => {
      if (err) {
        console.error('Data update error', JSON.stringify(err, null, 2));
        return reject(err);
      } else {
        console.log('Data update succeeded. ', JSON.stringify(data, null, 2));
        return resolve(data);
      }
    });
  });
}

/**
 * Deletes the demographics statistic record identified buy the given numeric zip code.
 * 
 * @param zipCode Number indicating the specific zip code jurisdiction to delete
 */
function deleteDemographicsByZipCode(zipCode) {
  return new Promise((resolve, reject) => {
    if (!zipCode || !parseInt(zipCode.toString(), 10)) {
      console.error('Unable to parse zip code to be deleted. Please provide a numeric zip code.');
      return reject(false);
    }

    zipCode = parseInt(zipCode.toString(), 10);
    const dynamoDbClient = _awsDynamoDb(new _awsSdk.DynamoDB(config));
    
    dynamoDbClient.table(table).where('zip_code').eq(zipCode).delete((err, data) => {
      if (err) {
        console.error('Deletion failed.', JSON.stringify(err, null, 2));
        return reject(err);
      } else {
        console.log('Data deletion succeeded.');
        return resolve(data);
      }
    });
  });
}

function createDemographicsTable() {
  return new Promise((resolve, reject) => {
    const dynamoDbClient = _awsDynamoDb(new _awsSdk.DynamoDB(config));

    var params = {
      TableName: 'Demographics',
      KeySchema: [ { AttributeName: 'zip_code', KeyType: 'HASH' }, { AttributeName: 'num_participants', KeyType: 'RANGE' } ],
      AttributeDefinitions: [ { AttributeName: 'zip_code', AttributeType: 'N' }, { AttributeName: 'num_participants', AttributeType: 'N' } ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    };

    dynamoDbClient.createTable(params, (err, data) => {
      if (err) {
        console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
        reject(err);
      } else {
        console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
        resolve(data);
      }
    });
  });
}

//getDemographicsByZipCode(10001).then((result) => { console.log(result); }).catch((err) => { console.log(err); });
//createDemographics(99999, 20, { count_male: 10, count_female: 10, count_gender_unknown: 0, count_other_ethnicity: 0, count_black_non_hispanic: 3, count_asian_non_hispanic: 1, count_pacific_islander: 9, count_us_citizen: 20, count_white_non_hispanic: 7 } );
//updateDemographics(55555, { num_participants: 551, count_asian_non_hispanic: 5, count_black_non_hispanic: 6, count_male: 550, count_female: 1, count_pacific_islander: 5, count_us_citizen: 550, extra_field: { some_list: [55, 'a'], some_val: true }  }).then((result) => {
//  console.log(result);
//}).catch((err) => { console.error(err); });
//getAllDemographics().then((result) => { console.log(result); }).catch((err) => {console.log(err);});
//createDemographics(55555, 5);
//getDemographicsByZipCode(55555).then((result) => { console.log(result); console.log(result[0].extra_field.some_list); }).catch((err) => { console.log(err); });
//deleteDemographicsByZipCode(55555);

// Master handler for all reqs.. In the process of being broken apart
module.exports.handler = function(event, context, callback) {
  var result = null;

  if (!event) {
    return callback(null, 'No event detected');
  }

  if (event.method === 'GET') {
    if (event.zipCode) {
      getDemographicsByZipCode(event.zipCode).then((res) => {
        result = res;
        callback(null, result);
      }).catch((err) => {
        console.log(err);
        result = err;
        callback(null, result);
      });
    } else {
      getAllDemographics().then((res) => {
        result = res;
        callback(null, result);
      }).catch((err) => {
        console.log(err);
        result = err;
        callback(null, result);
      });
    }
  } else if (event.method === 'POST') {
    // TODO: test this functionality!
    if (event.zip_code && event.num_participants) {
      if (event.additional_fields) {
        event.additional_fields.junk_field = undefined;
        event.additional_fields.num_participants = event.num_participants;
      }
      
      updateDemographics(event.zip_code, event.additional_fields).then((res) => {
        callback(null, res);
      }).catch((err) => {
        console.log(err);
        callback(null, err);
      });
    } else {
      callback(null, 'Received invalid update request. Please specify at least zip_code and num_participants.');
    }
  } else if (event.method === 'PUT') {
      if (event.zip_code && event.num_participants) {
        if (event.additional_fields) {
          event.additional_fields.junk_field = undefined;
        }

        createDemographics(event.zip_code, event.num_participants, event.additional_fields).then((res) => {
          result = res;
          callback(null, result);
        }).catch((err) => {
          console.log(err);
          result = err;
          callback(null, result);
        });
      } else {
        callback(null, 'Invalid creation request. Please specify at least zip_code and num_participants.');
      }
  } else if (event.method === 'DELETE' && event.zip_code) {
    deleteDemographicsByZipCode(event.zip_code).then((res) => {
      result = res;
      callback(null, result);
    }).catch((err) => {
      console.log(err);
      result = err;
      callback(null, result);
    });
  } else {
    callback(null, 'HTTP request incompatible with API. Please check format.');
  }

};

module.exports.listAllDemographicsHandler = function(event, context, callback) {
    if (!event) {
        return callback(null, 'No event detected');
    }

    if (event.method === 'GET') {
        getAllDemographics().then((res) => {
            callback(null, res);
        }).catch((err) => {
            console.log(err);
            callback(null, err);
        });
    } else {
        return callback(null, 'Invalid event method provided: ' + event.method);
    }
};

module.exports.getSpecificDemographicsHandler = function(event, context, callback) {
    if (!event) {
        return callback(null, 'No event detected');
    }

    if (event.method === 'GET' && event.zipCode) {
        getDemographicsByZipCode(event.zipCode).then((res) => {
            return callback(null, res);
        }).catch((err) => {
            conole.log(err);
            return callback(null, err);
        });
    } else {
        return callback(null, 'Invalid event method or zipCode provided: ' + event.method + '|' + event.zipCode + '.');
    }
};

module.exports.putDemographicsHandler = function(event, context, callback) {
    if (!event) {
        return callback(null, 'No event detected');
    }

    if (event.method === 'PUT') {
        if (event.zip_code && event.num_participants) {
            if (event.additional_fields) {
                event.additional_fields.junk_field = undefined;
            }

            createDemographics(event.zip_code, event.num_participants, event.additional_fields).then((res) => {
                return callback(null, res);
            }).catch((err) => {
                console.log(err);
                return callback(null, err);
            });
        } else {
            return callback(null, 'Invalid creation request. Please specify at least zip_code and num_participants.');
        }
    } else {
        return callback(null, 'Invalid event method provided: ' + event.method);
    }
};


module.exports.deleteDemographicsHandler = function(event, context, callback) {
    if (!event) {
        return callback(null, 'No event detected');
    }

    if (event.method === 'DELETE' && event.zip_code) {
        deleteDemographicsByZipCode(event.zip_code).then((res) => {
            return callback(null, res);
        }).catch((err) => {
            console.log(err);
            return callback(null, err);
        });
    } else {
        return callback(null, 'Invalid event method or zip_code provided: ' + event.method + '|' + event.zip_code + '.');
    }
};

