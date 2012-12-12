//This is based of the work of
//https://github.com/fabrik42/pusher
//
//
//For details see: http://pusher.com/docs/rest_api

/**
 * Constructor expects options as:
 * 
 * {
        appId:  YOUR_app_id,
        appKey: YOUR_auth_key,
        secret: YOUR_auth_secret
    }
    */
function Pusher(options) {
    this.options = options;
    this.url = 'http://api.pusherapp.com';
    this.headers = {"Content-Type": "application/json"};
}
/**
 * Return a channel
 */
Pusher.prototype.channel = function(chan){
    this.options.channel = chan; 
    return this;
};
/**
 * Trigger the event for this channel
 */
Pusher.prototype.trigger = function(event, data) {
    this.event = event;
    this.data = data;
    
    this.jsonData = ssj.OBJ2JSON({"name": event,"channels":[this.options.channel],
        "data":JSON.stringify(data)});
    
    this.body_md5 = ssj.md5(this.jsonData);
        
    var response = ssj.httpRequest(this.path(),
        "POST", 
        this.jsonData,
        "string", this.headers);
};
/**
 * Return the url path to POST to
 */
Pusher.prototype.path = function() {
    return this.url 
        + this.uri() + '?' 
        + this.queryString() 
        + '&auth_signature=' + this.signature();
};
/**
 * Return the uri
 */
Pusher.prototype.uri = function() {
    return '/apps/' + this.options.appId + '/events';
};
/**
 * Return the queryString with the body_md5 
 */
Pusher.prototype.queryString = function() {
    var timestamp = parseInt(new Date().getTime() / 1000);
    return [
      'auth_key=',        this.options.appKey,
      '&auth_timestamp=', timestamp,
      '&auth_version=',   '1.0',
      '&body_md5=',       this.body_md5,
    ].join('');
}
/**
 * Return the Google HmacSHA256 for the querystring
 */ 
Pusher.prototype.signature = function() {
    var signData = ['POST', this.uri(), this.queryString()].join('\n');
    var crypto = CryptoJS.HmacSHA256(signData, this.options.secret);
    return crypto.toString();
};
