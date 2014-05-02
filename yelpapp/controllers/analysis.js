var mongoose = require('mongoose')
  , fs = require('fs')
  , spawn = require('child_process').spawn
  , Checkin = mongoose.model('Checkin')
  , path = require('path');

  // status
exports.analysis = function (req, res, next) {
      var id= req.params.id;
      var action = function (err, collection) {
      // Locate all the entries using find
      collection.find({business_id:id}).toArray(function(err, results) {
          var info= results[0].checkin_info;
          // for (var i = 0; i < Object.keys(info).length; i++) {
          //   Object.keys(info)[i]
          //   console.log(Object.keys(info)[i]);
          // };
          var sortresult= Object.keys(info).sort(function(a,b){return info[b]-info[a]});
          var split = sortresult[0].split('-');
          var time,week;
          if (split[0]>=12) {
            time="PM";
          } else{
            time="AM"
          };

          if (split[1]==0) {
            week = "Sunday";
          } else if (split[1]==1) {
            week = "Monday";
          } else if (split[1]==2) {
            week = "Tuesday";
          } else if (split[1]==3) {
            week = "Wednesday";
          } else if (split[1]==4) {
            week = "Thursday";
          } else if (split[1]==5) {
            week = "Friday";
          } else if (split[1]==6) {
            week = "Saturday";
          } ;
          res.json({status: 'success',"Peak time": week+' '+split[0]+time});
      });
  };

  mongoose.connection.db.collection('checkin', action);

};


 // status
exports.review = function (req, res, next) {
      var id= req.params.id;
      //console.log(id);
      var outputFilename = 'review_analysis/review.json';
      var review={};
      var reviewdata = '';
      var analysis_result;
      var review_ANA = spawn('python', ['review_analysis/ML_review.py']);
      var action = function (err, collection) {
      // Locate all the entries using find
      collection.find({business_id:id}).toArray(function(err, results) {
          for (var i = 0; i < results.length; i++) {
            //console.log("results[i].text",results[i].text);
            review.text=review.text+results[i].text;
          };
          review.text.replace("undefined", "");
          //console.log(review);
          fs.writeFile(outputFilename, JSON.stringify(review), function(err) {
              if(err) {
                console.log(err);
              } else {

                console.log("JSON saved to " + outputFilename);

                review_ANA.stdout.on('data', function(data) {
                  reviewdata += data.toString();
                  //reviewdata = reviewdata.replace(/(\r\n|\n|\r)/gm,"");
                  // var reviewdata=reviewdata.split("\n");
                   // console.log("reviewdata",reviewdata);
                });
            
                review_ANA.stderr.on('data', function(data) {
                   var string= data.toString();
                    if (string.indexOf("INFO : topic") > -1) {
                      analysis_result += string;
                      //console.log("result");
                    };

                });
                review_ANA.on('exit', function (code) {
                  console.log("finaldata",analysis_result);
                  fs.unlink(outputFilename, function (err) {
                    if (err) throw err;
                    console.log('successfully deleted outputFilename');
                  });
                  res.json({status: 'success',"Result": analysis_result.replace("undefined", "")});
                  console.log('child process exited with code ' + code);
                });
              }
          }); 
          //console.log(results);

          //res.json({status: 'success'});
      });
  };

  mongoose.connection.db.collection('review', action);

};


// status
exports.map = function (req, res, next) {
      //console.log(id);
      var outputFilename = 'views/welcome/business.json';
      var businessData={};
      var reviewdata = '';
      var analysis_result;
      var review_map = spawn('python', ['review_analysis/map_review.py']);
      var action = function (err, collection) {
      // Locate all the entries using find
        collection.find().toArray(function(err, results) {
            for (var i = 0; i < results.length; i++) {
              // console.log(results[i]);
              businessData[results[i].business_id] = [results[i].latitude,results[i].longitude,results[i].categories]

            };
            console.log(businessData);
            fs.writeFile(outputFilename, JSON.stringify(businessData), function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log("JSON saved to " + outputFilename);
                res.render('welcome/map',{
                    businesses:results,
                    businessData:businessData
                });
              }
          }); 

            //console.log(results);

            //res.json({status: 'success'});
        });
      };

  mongoose.connection.db.collection('business', action);

};

