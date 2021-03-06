const AWS = require("aws-sdk"),
  _ = require('underscore'),
  constants = require('../constants'),
  utils = require('./utils'),
  Boom = require('boom'),
  errors = require('./errors')
  envCfg = require('../../env');

const data = require('../data')

var ApiController = {

  login(request, reply) {

    reply('OK');

  },

  logout: function (request, reply) {

    reply({}).unstate(constants.tokenCookieName);

  },

  getCallout: function(request, reply) {

    let promise = data.Callout.get(request.params.id)

    utils.standardResponse(promise, request, reply)

  },

  createCallout: function(request, reply) {

    let response;

    let promise = data.Callout.create(request.payload)
      .then(res => response = res)
      .then(() => sendMessageToSNS(`Urgent situation, please go to the following URL for details`))
      .then(() => sendMessageToSNS(`${envCfg.rrnBaseUrl}/response/${response.CalloutId}/new`))
      .then(() => response)

    utils.standardResponse(promise, request, reply)

  },

  createResponse: function(request, reply) {

    let response,
      callout,
      calloutId = request.payload.CalloutId;

    let promise = data.Response.getBy()
      // .then(responses => {
      //   if (_.any(responses, (r) => r.CanRespond === 'yes' && r.CalloutId === calloutId)) throw new errors.ConflictError()
      // })
      .then(() => data.Callout.get(calloutId))
      .then(c => {
        if (!c) throw new errors.NotFoundError();
        return c
      })
      .then((callout) => {
        if (callout) {
          return data.Response.create(request.payload)
            .then(res => response = res)
            .then(() => {
              if (response.CanRespond.toLowerCase() === 'yes') {
                return sendMessageToPhoneNumber(callout.Phone, `An attorney is on the way. ETA is ${response.Eta}. Their name is ${response.Name}`)
                  .then(() => sendMessageToSNS(`${response.Name} is responding to Callout ${calloutId}.`))
              }
            })
            .then(() => response)
        }
      })

    utils.standardResponse(promise, request, reply)

  },

  createResponder: function(request, reply) {

    let responder;

    const message = "You've been added to the Santa Fe Rapid Response Immigrant Protection Network."

    const promise = subscribeToSNS(request.payload.Phone)
      .then(({ SubscriptionArn }) => data.Responder.create(Object.assign(request.payload, {SubscriptionArn})))
      .then(result => responder = result)
      .then(() => sendMessageToPhoneNumber(responder.Phone, message))

    utils.standardResponse(promise, request, reply)
  },

  removeResponder: function(request, reply) {

    const promise = data.Responder.get(request.params.id)
      .then(Responder => unsubscribeFromSNS(Responder.SubscriptionArn))
      .then(() => data.Responder.remove(request.params.id))

    utils.standardResponse(promise, request, reply)

  },

  getResponders: function(request, reply) {

    let promise = data.Responder.getAll()

    utils.standardResponse(promise, request, reply)

  }
};


module.exports = ApiController;


/**
 * SNS helper
 * @param  {[type]} method [description]
 * @param  {[type]} params [description]
 * @return [type]          [description]
 */
function _sns(method, params) {

  const sns = new AWS.SNS();

  return new Promise((ful, rej) => {
    sns[method](params, function(err, data) {
      if (err) return rej(err)
      ful(data)
    });

  })

}

/**
 * Remove responder from SNS topic
 * @param  {[type]} SubscriptionArn [description]
 * @return [type]               [description]
 */
function unsubscribeFromSNS(SubscriptionArn) {

  return _sns("unsubscribe", {
    SubscriptionArn
  })

}

/**
 * Sign up responder to SNS topic
 * @param  {[type]} phoneNumber [description]
 * @return [type]               [description]
 */
function subscribeToSNS(phoneNumber) {

  return _sns("subscribe", {
    Endpoint: `+1${phoneNumber}`,
    Protocol: 'sms',
    TopicArn: envCfg.rrnSnsTopic
  })

}

function sendMessageToPhoneNumber(phoneNumber, message) {

  return _sns("publish", {
    Message: message,
    PhoneNumber: `+1${phoneNumber}`
  })

}

function sendMessageToSNS(message) {

  return _sns("publish", {
    Message: message,
    TargetArn: envCfg.rrnSnsTopic
  })

}
