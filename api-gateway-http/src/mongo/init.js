// must be .js file, not .ts
/* eslint-disable */
db.createCollection('testCollection');
db.testCollection.insertOne({ name: 'test', value: 1, date: new Date() });
