'use strict';

const config = require('eslint-config-metarhia');

config[0].rules['no-invalid-this'] = 'off';

module.exports = [...config];
