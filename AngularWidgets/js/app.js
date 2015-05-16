var json;
var jsonMain;
var chart;
var imgOne;

FB.init({appId: "795138513865571", status: true, cookie: true});


var shareFB = function(){
  FB.ui({
          method: 'feed',
          name: json.street+", "+json.city+", "+json.state+"-"+json.zipcode,
          link: json.homedetails,
		  redirect_uri:document.URL,
		  picture: imgOne,
		  description : "Last Sold Price: "+json.lastSoldPrice+" 30 Days Overall Change: "+json.estimateValueChangeSign+json.estimateValueChange,
          caption: 'Property Information from Zillow.com',
            },  function(response) {
                if (response && response.post_id) {
                      alert('Posted successfully.');
                } else {
                    alert('Post aborted.');
                    }
                }
        );
};





$(function () {

    var URL = document.URL;
	if(URL.indexOf("post_id")>0)
		alert("Posted Successfully");

    $("#formInput").submit(function (e) {
        e.preventDefault();
    }).validate({

        messages: {
            txtStAddress: "This field is required",
            txtCityName: "This field is required",
            optState: "This field is required",
        },
        submitHandler: function (form) {
            var state = form[2].value;
            var city = form[1].value;
            var address =  form[0].value ;
            $.ajax({

                url: "http://sanmukh-env.elasticbeanstalk.com/",
                type: 'GET',
                data: $.param({ optState:state , txtCity:city, txtStAddress:address}),
                success: function (data, textStatus, jqxhr) {
				if(data=="NoMatch")
				{
				$("#nooutput").show();
				$("#output").hide();
				}
				else
				{
                    jsonMain = eval("(" + data + ")");
                    json = jsonMain.result;
					chart  = jsonMain.chart;
					var imgEst="";
					var imgZest="";
					if(json)
					{
					if(json.estimateValueChangeSign=="+")
                        imgEst = json.imgp;
                    else if(json.estimateValueChangeSign =="-")
                        imgEst = json.imgn;
                    if(json.restimateValueChangeSign=="+")
                        imgZest = json.imgp;
                    else if (json.restimateValueChangeSign == "-")
                       imgZest = json.imgn;
                    $('#useCode').html(json.useCode); 
                    $('#lastSoldPrice').html(json.lastSoldPrice); 
                    $('#yearBuilt').html(json.yearBuilt); 
                    $('#lastSoldDate').html(json.lastSoldDate); 
                    $('#lotSize').html(json.lotSize); 
                    $('#zestimateAmount').html(json.estimateAmount); 
                    $('#finishedSqFt').html(json.finishedSqFt); 
					if(imgEst!="")
                    $('#valueChange').html("<img src='"+imgEst+"'/>"+json.estimateValueChange); 
					else
					$('#valueChange').html(json.estimateValueChange); 
                    $('#bathrooms').html(json.bathrooms); 
					if(json.estimateValuationRangeLow!="NA")
                    $('#valuationRange').html(json.estimateValuationRangeLow+"-"+json.estimateValuationRangeHigh); 
                    else
					$('#valuationRange').html("NA");
					$('#bedrooms').html(json.bedrooms); 
                    $('#rentzestimateAmount').html(json.restimateAmount); 
                    $('#taxAssessmentYear').html(json.taxAssessmentYear);
                    if(imgZest!="")
					$('#rvalueChange').html("<img src='"+imgZest+"'/>"+json.restimateValueChange);
					else
					$('#rvalueChange').html(json.restimateValueChange);
                    $('#taxAssessment').html(json.taxAssessment);
					if(json.restimateValuationRangeLow!="NA")
                    $('#rvaluationRange').html(json.restimateValuationRangeLow+"-"+json.restimateValuationRangeHigh);
                    else
					$('#rvaluationRange').html("NA");
					
                    $("#addressLink").html(json.street+","+json.city+","+json.state+"-"+json.zipcode);
                    $("#addressLink").attr("href",json.homedetails);
                    $('#zestimateDate').html(json.estimateLastUpdate);
                    $('#rentzestimateDate').html(json.restimateLastUpdate);
							$(".propName").html(json.street+","+json.city+","+json.state+"-"+json.zipcode);
                   }
					if(chart)
					{
					if(chart["1year"])
					{
					imgOne= chart["1year"].url;
					
					$("#oneYear").attr("src",chart["1year"].url);
					}
					else
					{
					imgOne = "";
					$("#oneYear").removeAttr("src");
					}
					if(chart["5years"])
					$("#fiveYears").attr("src",chart["5years"].url);
					else
						$("#fiveYears").removeAttr("src");
					if(chart["10years"])
					$("#tenYears").attr("src",chart["10years"].url);
					else
					$("#tenYears").removeAttr("src");
					
					
					}
					
			
					$("#output").show();
					$("#nooutput").hide();
}                  
				  var i =0;
                },
                error: function (jqxhr, textStatus, errorMessage) {
                    console.log(argument);
                }
            })
        },
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                //resize code goes here
            }
			$("#output").hide();
			$("#nooutput").hide();
        }
    });

	

	
    $("#formInput").click =  function () {
        if (("#formInput").valid()) {
            var j = 0;
        }
    };
});



