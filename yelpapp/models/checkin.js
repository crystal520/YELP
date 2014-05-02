var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var CheckinSchema = new Schema({
	type:{type: String },
    business_id:{type: String },
    checkin_info : {type: String}
});

module.exports = mongoose.model('Checkin', CheckinSchema);