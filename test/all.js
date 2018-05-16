'use strict';

const metatests = require('metatests');
global.api = { do: require('..'), metatests };

api.metatests.namespace({ do: api.do });

const all = ['chain', 'collector'];
all.forEach(name => require('./' + name));

api.metatests.report();
