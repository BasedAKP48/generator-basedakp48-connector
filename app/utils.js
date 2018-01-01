'use strict';
const isScoped = require('is-scoped');

exports.repoName = name => isScoped(name) ? name.split('/')[1] : name;
