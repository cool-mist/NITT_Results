// --------------------------------------------------Change these variables for ur needs ----------------------------------------------.
var def = 106112000;    					  //base roll_no of class                                                                  |
var nameOfFile = def+'';					  // <Ur desired name of file to be written > default is (rollnoseries)                    |
/*																																	   |
	Base Roll Nos of classes                                                                    									   |
																																	   |
    1061xx000 :- Computer Science n Engineering																						   |
	1031xx000 :- Civil																												   |
	1101xx000 :- ICE																												   |
	1071xx000 :- EEE   																												   |
	1081xx000 :- ECE																												   |
 																																	   |
---------------------------------------------------------------------------------------------------------------------------------------'
*/


var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');


var url = 'http://www.nitt.edu/prm/nitreg/ShowRes.aspx';
var newVs;
var postData;
var vwre = /name=\"__VIEWSTATE\" value=\"(.+)\"/;
var viewstate;
var masterList = [];
var wstream = fs.createWriteStream(nameOfFile);


var callback = function(){
	console.log("Over");
}

function findVs(postData,callback){
	console.log("findVs called");
	var cookieJar = request.jar();
	request.post({
    uri:url,
    jar:cookieJar,
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
    	$ = cheerio.load(body);
       console.log(body);
        var Vs = body.match(vwre)[1];
        var postData2;
		
	    for (var i = 1; i < 120; i++) {
			rollno = def+i+'';                  // 106112000 is computer science... 
			postData2 = {
				__EVENTTARGET: 'Dt1',
				__EVENTARGUMENT: '',
				__VIEWSTATE:Vs,
				TextBox1:rollno,
				Dt1:'96'
			};
		
        	request.post({
       			uri : url,
       			jar : cookieJar,
       			headers:{'content-type': 'application/x-www-form-urlencoded'},
    			body:require('querystring').stringify(postData2)
    		},function(err,resp,body){

    			var person = [];
    			$ = cheerio.load(body);
    			person["Name"] = $("#LblName").text();
    		
    			person["GPA"] = $("#LblGPA").text();
    			if(person["Name"].length != 0){
    				while(person["Name"].length < 35){
    					person["Name"]+=' ';
    				}
    				masterList.push(person);
    				var t2w = $("#LblEnrollmentNo").text()+ '. ' + person["Name"]+' '+person["GPA"];
    				wstream.write(t2w + '\n');
    				console.log(person["Name"]);
    			}

    		});

		};
	});
	
}
console.log("Started for " + def);
console.log("Wait till the output file contains the desired results (depends in your internet connection) ");
function getResults(callback){
	request(url,function(err,resp,body){
		if(err) throw err;
		$ = cheerio.load(body);
		viewstate = body.match(vwre)[1];
		var evtTarget = "Dt1".split("$").join(":");
		postData = {

			__VIEWSTATE:viewstate,
			TextBox1:def + '',
			Button1:'Show'
		};
		findVs(postData,function(){
			callback();
			});
	
	});

}
getResults(callback);




