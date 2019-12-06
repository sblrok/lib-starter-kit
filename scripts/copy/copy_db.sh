printf "use hijay\ndb.dropDatabase()\ndb.copyDatabase('hijay-production', 'hijay', 's3.mgbeta.ru:10098')" | mongo hijay2.mgbeta.ru:10008
