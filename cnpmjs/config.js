
'use strict';

/**
 * Module dependencies.
 */
var mkdirp = require('mkdirp');
var copy = require('copy-to');
var path = require('path');
var fs = require('fs');
var os = require('os');

var version = require('../package.json').version;

var root = path.dirname(__dirname);
var dataDir = '/var/data/cnpmjs/';

var config = {
  version: version,
  enableCluster: true,
  numCPUs: os.cpus().length,
  registryPort: 7001,
  webPort: 7002,
  bindingHost: '0.0.0.0',
  debug: process.env.NODE_ENV === 'development',
  pagemock: process.env.NODE_ENV === 'development',
  sessionSecret: 'cnpmjs.org test session secret',
  jsonLimit: '10mb',
  logdir: path.join(dataDir, 'logs'),
  uploadDir: path.join(dataDir, 'downloads'),
  viewCache: false,
  limit: {
    enable: false,
    token: 'koa-limit:download',
    limit: 1000,
    interval: 1000 * 60 * 60 * 24,
    whiteList: [],
    blackList: [],
    message: 'request frequency limited, any question, please contact fengmk2@gmail.com',
  },
  enableCompress: true, // enable gzip response or not
  admins: {
    palmtale: 'm@glad.so'
  },
  mail: {
    enable: false,
    appname: 'glad.so',
    from: 'Noreply <noreply@glad.so>',
    service: 'gmail',
    auth: {
      user: 'address@gmail.com',
      pass: 'your password'
    }
  },

  logoURL: 'https://os.alipayobjects.com/rmsportal/oygxuIUkkrRccUz.jpg', // cnpm logo image url
  adBanner: '',
  customReadmeFile: '', // you can use your custom readme file instead the cnpm one
  customFooter: '', // you can add copyright and site total script html here
  npmClientName: 'cnpm', // use `${name} install package`
  packagePageContributorSearch: true, // package page contributor link to search, default is true
  maxDependencies: 200,
  backupFilePrefix: '/cnpm/backup/',

  /**
   * database config
   */

  database: {
    dialect: 'mysql',
    host: '192.168.50.83',
    port: 3306,
    db: 'cnpmjs',
    username: 'cnpmjs',
    password: 'cnpmjs',
    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: {
      maxConnections: 10,
      minConnections: 0,
      maxIdleTime: 30000
    },

    // the storage engine for 'sqlite'
    // default store into ~/.cnpmjs.org/data.sqlite
    storage: path.join(dataDir, 'data.sqlite'),

    logging: !!process.env.SQL_DEBUG,
  },

  // package tarball store in local filesystem by default
  nfs: require('fs-cnpm')({
    dir: path.join(dataDir, 'nfs')
  }),
  // if set true, will 302 redirect to `nfs.url(dist.key)`
  downloadRedirectToNFS: false,

  // registry url name
  registryHost: 'r.cnpmjs.org',

  /**
   * registry mode config
   */

  // enable private mode or not
  // private mode: only admins can publish, other users just can sync package from source npm
  // public mode: all users can publish
  enablePrivate: true,

  // registry scopes, if don't set, means do not support scopes
  scopes: [ '@soglad', '@sogladtest', '@soglad-test' ],

  // some registry already have some private packages in global scope
  // but we want to treat them as scoped private packages,
  // so you can use this white list.
  privatePackages: [],

  /**
   * sync configs
   */

  // the official npm registry
  // cnpm wont directly sync from this one
  // but sometimes will request it for some package infomations
  // please don't change it if not necessary
  officialNpmRegistry: 'https://registry.npmjs.com',

  // sync source, upstream registry
  // If you want to directly sync from official npm's registry
  // please drop them an email first
  sourceNpmRegistry: 'https://registry.npm.taobao.org',

  // upstream registry is base on cnpm/cnpmjs.org or not
  // if your upstream is official npm registry, please turn it off
  sourceNpmRegistryIsCNpm: true,

  // if install return 404, try to sync from source registry
  syncByInstall: true,

  // sync mode select
  // none: do not sync any module, proxy all public modules from sourceNpmRegistry
  // exist: only sync exist modules
  // all: sync all modules
  syncModel: 'exist', // 'none', 'all', 'exist'

  syncConcurrency: 1,
  // sync interval, default is 10 minutes
  syncInterval: '10m',

  // sync polular modules, default to false
  // because cnpm can't auto sync tag change for now
  // so we want to sync popular modules to ensure their tags
  syncPopular: false,
  syncPopularInterval: '1h',
  // top 100
  topPopular: 100,

  // sync devDependencies or not, default is false
  syncDevDependencies: false,

  // badge subject on http://shields.io/
  badgePrefixURL: 'https://img.shields.io/badge',
  badgeSubject: 'cnpm',

  // custom user service, @see https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
  userService: null,

  // always-auth https://docs.npmjs.com/misc/config#always-auth
  // Force npm to always require authentication when accessing the registry, even for GET requests.
  alwaysAuth: false,

  // if you're behind firewall, need to request through http proxy, please set this
  // e.g.: `httpProxy: 'http://proxy.mycompany.com:8080'`
  httpProxy: null,
};

if (process.env.NODE_ENV !== 'test') {
  var customConfig;
  if (process.env.NODE_ENV === 'development') {
    customConfig = path.join(root, 'config', 'config.js');
  } else {
    // 1. try to load `$dataDir/config.json` first, not exists then goto 2.
    // 2. load config/config.js, everything in config.js will cover the same key in index.js
    customConfig = path.join(dataDir, 'config.json');
    if (!fs.existsSync(customConfig)) {
      customConfig = path.join(root, 'config', 'config.js');
    }
  }
  if (fs.existsSync(customConfig)) {
    copy(require(customConfig)).override(config);
  }
}

mkdirp.sync(config.logdir);
mkdirp.sync(config.uploadDir);

module.exports = config;

config.loadConfig = function (customConfig) {
  if (!customConfig) {
    return;
  }
  copy(customConfig).override(config);
};