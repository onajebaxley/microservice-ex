'use strict';

const sendEmail = require('send-email');
const AWS = require('aws-sdk');
var ses = new AWS.SES({
    region: 'us-east-1'
});

const emailPayload = {
    'to': 'onaje.baxley@gmail.com',
    'from': 'onaje.baxley@gmail.com',
    'subject': 'DynamoDB Table Updated',
};

// This emailing handler works locally, likely will fail as AWS Lambda
function handler(event, context, callback) {
    if (!event || !event.Records) {
        let message = 'Something went wildly wrong here, no event or record stream present.';
        console.log(message);
        return callback(null, message);
    }

    var eParams = {
        Destination: {
            ToAddresses: ['onaje.baxley@gmail.com']
        }, Message: {
            Body: {
                Text: {
                    Data: 'The DynamoDB table "demographics" has just received a new record!'
                }
            },
            Subject: {
                Data: 'DynamoDB Table Updatedd'
            }
        },
            Source: 


    event.Records.forEach((record) => {
        if (record.eventName === 'INSERT' || true) {
            emailPayload['text'] = 'The DynamoDB table "demographics" has just received a new record.';
            console.log('Attempting to send payload:');
            console.log(emailPayload);
            sendEmail(emailPayload).then((res) => {
                console.log(res);
                return callback(null, 'Successfully sent new-record email.');
            }).catch((err) => {
                console.log('Error sending new-record email:');
                console.log(err);
            });
        } else if (record.eventName === 'MODIFY') {
            emailPayload['text'] = 'The DynamoDB table "demographics" has just been updated.';
            sendEmail(emailPayload).then((res) => {
                console.log(res);
                return callback(null, 'Successfully sent updated-record email.');
            }).catch((err) => {
                console.log('Error sending updated-record email:');
                console.log(err);
            });
        }

        console.log('DynamoDB Record: %j', record.dynamodb);
    });

    return callback(null, `Successfully processed ${event.Records.length} records.`);
};

module.exports.handler = handler;

//handler({ Records: [ { eventName: 'INSERT' } ] }, {}, (something, somethingelse) => { });

