var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');


var url = 'http://www.nitt.edu/prm/nitreg/ShowRes.aspx';
var newVs;
var postData;
var vwre = /name=\"__VIEWSTATE\" value=\"(.+)\"/;
var viewstate;
var masterList = [];

//_______________________________________________________________________________________________
//                      ____                         ____     _____
//                     /       |   |    /\    |\  | /        |
//                    |        |---|   /__\   | \ | |   __.  |__
//                     \____   |   |  /    \  |  \|  \____|  |______
//
//
//                      |   |   __          __
//                      |---|  (__)  |---  (__)
//                      |   |   \__  |      \__
//
//
//			DefaultRollNo must be rollNo of the first person in your batch in your class

				var DefaultRollNo = 111112001;

// ______________________________________________________________________________________________

var departs = ['Archi','Chem','Civil','','','CSE','EEE','ECE','','ICE','Mech','Meta','','Prod'];
var nameOfFile = '';
var branch = parseInt((DefaultRollNo+'').substring(1,3));
if(branch<15){
	nameOfFile+=departs[branch-1];
}else{
	nameOfFile+=(branch-1);
}

var year = parseInt((DefaultRollNo+'').substring(4,6));
var endYear = year+4;
nameOfFile+= ('_'+year + '-' + endYear +'.txt');
var wstream = fs.createWriteStream(nameOfFile);
function findVs(postData){
	var cookieJar = request.jar();
	request.post({
    uri:url,
    jar:cookieJar,
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
    	$ = cheerio.load(body);
       
       var Vs = body.match(vwre)[1];
       
       
		var postData2;
		
		for (var i = 1; i < 120; i++) {
			rollno = DefaultRollNo+i+'';                  // 106112000 is computer science... 
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
    		person["Roll"] =  $("#LblEnrollmentNo").text();
    		person["GPA"] = $("#LblGPA").text();
    		if(person["Name"].length != 0){
    			while(person['Name'].length !=35) person['Name']+=' ';
    			 masterList.push(person);
    			var t2w =person["Roll"]+ '. ' + person["Name"]+' '+person["GPA"];
    			wstream.write(t2w + '\r\n' + '\n');
    		}

    	}
       );



		};

		
		 
    
	});
}

function getResults(){
	request(url,function(err,resp,body){
		if(err) throw err;
		$ = cheerio.load(body);
		viewstate = body.match(vwre)[1];
		var evtTarget = "Dt1".split("$").join(":");
		postData = {

			__VIEWSTATE:viewstate,
			TextBox1:DefaultRollNo + '',
			Button1:'Show'
		};
		findVs(postData);
	
	});
}
getResults();




