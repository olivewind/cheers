#!/usr/bin/env node

const { getOptions } = require('./utils/options');
const { Cheers } = require('./cheers');

const options = getOptions();

const cheers = new Cheers(options);

cheers.run();
