var userObj = {email_exception:false};

(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8';
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// facebook
  	window.fbAsyncInit = function() {
		FB.init({
			appId      : '437045420030909',
			cookie     : true,  // enable cookies to allow the server to access 
			status     : true,  // the session
			xfbml      : true,  // parse social plugins on this page
			version    : 'v2.8' // use graph api version 2.8
		});
	}

function handleClientLoad() {
	// Loads the client library and the auth2 library together for efficiency.
	// Loading the auth2 library is optional here since `gapi.client.init` function will load
	// it if not already loaded. Loading it upfront can save one network request.
	gapi.load('client:auth2', initClient);
}

function initClient() {
    // Initialize the client with API key and People API, and initialize OAuth with an
    // OAuth 2.0 client ID and scopes (space delimited string) to request access.
    gapi.client.init({
        apiKey: 'AIzaSyCu2YOZ50VDk3kIpbcOw0ubBeV3KHjJwxA',
        discoveryDocs: ["https://people.googleapis.com/$discovery/rest?version=v1"],
        clientId: '510343084319-7hce5e80h5olvobkb5nnbsvsfsivlols.apps.googleusercontent.com',
        scope: 'profile'
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
    // When signin status changes, this function is called.
    // If the signin status is changed to signedIn, we make an API call.
    if (isSignedIn) {
      makeApiCall();
    } else {
    	$('.fa-spin').remove();
    }
}

function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function makeApiCall() {
    // Make an API call to the People API, and print the user's given name.
    // gapi.client.people.people.get({
    //   'resourceName': 'people/me',
    //   'requestMask.includeField': 'person.names'
    // }).then(function(response) {
    // 	console.log(response);
    //   console.log('Hello, ' + response.result.names[0].givenName);
    // }, function(reason) {
    //   console.log('Error: ' + reason.result.error.message);
    // });
    gapi.client.load('plus','v1', function(){
		var request = gapi.client.plus.people.get({
		   'userId': 'me'
		});
		request.execute(function(resp) {
			var newObj = {};
			newObj['first_name'] = resp.name.givenName;
			newObj['last_name'] = resp.name.familyName;
			newObj['id'] = resp.id;
			newObj['type'] = 'Google';

			if(resp.emails.length > 0) {
				newObj['email'] = resp.emails[0]['value'];
				userObj = newObj;
				userObj['email_exception'] = false;
				sendLoginInfo(userObj);
			} else {
				userObj = newObj;
				$('#userEmailAddress').modal({backdrop: 'static',keyboard: false});
			}
		});
	});
}

function sendLoginInfo(formdata) {
	$('#emailAddressBtn').prop('disabled',true);
	$.ajax({url:'/social/socialLogin',type:'post',data:formdata,dataType:'json',
	beforeSend: function(request) {
		//request.setRequestHeader("Content-Type", 'application/json');
	},
	success:function(res) {
		$('#emailAddressBtn').prop('disabled',false);
		$('.fa-spin').remove();
		if(res.success) {
			window.location.href = res.url
		} else {
			$('#errormessage').html('');
			res.errors.forEach(function(err){
				$('#errormessage').append('<p>'+err.msg+'</p>');
			});
		}
	},error: function(err) {
		$('#emailAddressBtn').prop('disabled',false);
		$('#errormessage').html(err);
	}});
}

$(function(){
  	
  	

	$(document).on('click','.btn-facebook',function() {
		$('.fa-spin').remove();
		if(FB) {
			$(this).append('&nbsp;<i class="fa fa-refresh fa-spin"></i>');
			FB.login(function(response) {
				statusChangeCallback(response);
			}, {scope: 'public_profile,email'});
		} else {
			alert('Page hasn\'t loaded yet. Please try after few seconds!');
		}
	});


	// This is called with the results from from FB.getLoginStatus().
	function statusChangeCallback(response) {
	    // The response object is returned with a status field that lets the
	    // app know the current login status of the person.
	    // Full docs on the response object can be found in the documentation
	    // for FB.getLoginStatus().
	    if (response.status === 'connected') {
	      	// Logged into your app and Facebook.
	      	console.log('Welcome!  Fetching your information.... ');
			var url = '/me?fields=first_name,last_name,email';
			FB.api(url, function (response) {
				response['type'] = 'Facebook';
				userObj = response;
				if(response.email === undefined) {
					$.ajax({url:'/user-manager/getBySocialId?id='+response.id,type:'get',success:function(docRes) {
						if(docRes.success) {
							if(docRes.data[0]._email === null || docRes.data[0]._email === undefined) {
								$('#userEmailAddress').modal({backdrop: 'static',keyboard: false});
							} else {
								userObj['email_exception'] = true;
								sendLoginInfo(userObj);
							}
						} else {
							$('#userEmailAddress').modal({backdrop: 'static',keyboard: false});
						}
					}});
				} else {
					userObj['email_exception'] = false;
					sendLoginInfo(userObj);
				}
		    },{scope: 'public_profile,email'});
	    } else {
	    	console.log('user closed dialog')
	    	$('.fa-spin').remove();
	      // The person is not logged into your app or we are unable to tell.
	      //document.getElementById('status').innerHTML = 'Please log ' +
	        //'into this app.';
	    }
	}

	$('#userEmailAddress').submit(function(e){
		e.preventDefault();
		var formdata = userObj;
		formdata['email'] = $("input[name='user_email']").val();
		formdata['email_exception'] = false;
		sendLoginInfo(formdata);
	});

	$(document).on('click','.btn-google-plus',function(){
		$('.fa-spin').remove();
		if(gapi) {
			$(this).append('&nbsp;<i class="fa fa-refresh fa-spin"></i>');
	        handleClientLoad();
	        setTimeout(function(){
	        	gapi.auth2.getAuthInstance().signIn();
	        },200);
	       	
	    } else {
	    	alert('Page hasn\'t loaded yet. Please try after few seconds!');
	    }
	});
});

