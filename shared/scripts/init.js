// must be .js file, not .ts
/* eslint-disable */
db.createCollection('testCollection');
db.testCollection.insertOne({ name: 'test', value: 1, date: new Date() });

db = db.getSiblingDB('auth');
db.createCollection('users');
db.createCollection('sessions');

db = db.getSiblingDB('content');
db.createCollection('articles');
db.createCollection('categories');
db.createCollection('tags');

db = db.getSiblingDB('media');
db.createCollection('images');
db.createCollection('videos');
db.createCollection('documents');
