# AWS-based Microservice Example

This repo reprsents the AWS-lambda functionality of a toy web service for interacting with demographics data supplied by [datasets.com](http://datasets.com)

API follows RESTful principles using the standard verbiage: GET/POST/PUT/DELETE

URL: https://pcki2fw0xk.execute-api.us-east-1.amazonaws.com/v1

### The service has only ONE resource: Demographics

Unfortunately, the dataset I used for this exmaple is very RDB-like hence the singular resource.

Anyway, its fields include:
 - zip_code*
 - num_participants*
 - count_male
 - count_female
 - count_gender_unknown
 - count_us_citizen
 - count_hispanic_latino
 - count_american_indian
 - count_white_non_hispanic
 - count_black_non_hispanic
 - count_other_ethinicty
 - count_pacific_islander
 - count_ethnicity_unknown

where "*" denotes a required field.

### Ex interactions of Demographics resource

#### Getting all demographics data
GET api/v1/demographics

#### Getting specifc demographics data
GET api/v1/demographics/{zipCode}

#### Creating specifc demographics data
PUT api/v1/demographics -d '{"zip_code": 22222, "num_participants": 0}'

#### Updating specifc demographics data (NOT YET TESTED)
POST api/v1/demographics/{zipCode} -d '{...}'

#### Deleting specific demographics data
DELETE api/v1/demographics/{zipCode}


