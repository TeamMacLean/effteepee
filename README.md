# EffTeePee

> File Browser

## Dependencies

* nodejs + npm
* mongodb

## Install

```
# install dependencies
$ npm install
$ bower install
```

## Usage


### Config

```
# create config from example
$ cp config-example.json config.json
```

### Development

```
# start in development mode
$ node bin/www

# add a user
$ scripts/newUser.js USERNAME PASSWORD EMAIL-ADDRESS
```

### Production

```
# install pm2
$ npm install -g pm2

# start effteepee
$ pm2 start index.js --name effteepee
$ pm2 save

# monitor status
$ pm2 monit

[optional] use keymetrics.io to monitor via web interface
```

