var config = {
    apiKey: "AIzaSyAWIx3G3QTGS7v4WKKLbwPJSgKWTc4pXI4",
    authDomain: "traintime-caad6.firebaseapp.com",
    databaseURL: "https://traintime-caad6.firebaseio.com",
    projectId: "traintime-caad6",
    storageBucket: "traintime-caad6.appspot.com",
    messagingSenderId: "444504554488"
  };
  firebase.initializeApp(config);

  //For Authenication using google account

  var provider = new firebase.auth.GoogleAuthProvider();
  //Redirect User to Google signin page If not already sign in
  firebase.auth().signInWithRedirect(provider);


  // Reference to a firebase database
  var trainInfo = firebase.database();

  // jQuery global variables
  var elTrain = $("#nameInput");
  var elTrainDestination = $("#destinationInput");

  // form validation for Time using jQuery Mask plugin
  var elTrainTime = $("#firstTrainInput");
  var elTimeFreq = $("#frequencyInput");

  
  /// Get Authicated user token
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // ...
    }
    // The signed-in user info.
    var user = result.user;
    console.log(user);
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });

  

  //calls StoreInDatabase to add train details if submit button is being clicked
  $("#submitBtn").on("click", function(){
  
    // form validation - if empty - alert
    if (elTrain.val().length === 0 || elTrainDestination.val().length === 0 || elTrainTime.val().length === 0 || elTimeFreq.val().length === 0) {
        alert("Please Fill All Required Fields");
    } else {
        // if form is filled out, run function
        storeInDatabase(event);
    }
  });

  // Calls storeInputs function if enter key is clicked
    $('form').on("keypress", function(event) {
        if (event.which === 13) {
            // form validation - if empty - alert
            if (elTrain.val().length === 0 || elTrainDestination.val().length === 0 || elTrainTime.val().length === 0 || elTimeFreq.val().length === 0) {
                alert("Please Fill All Required Fields");
            } else {
                // if form is filled out, run function
                storeInDatabase(event);
            }
        }
    });


  function storeInDatabase(event){
    event.preventDefault();
    var trainName =  elTrain.val().trim();
    var destination =  elTrainDestination.val().trim();
    var frequency =  elTimeFreq.val().trim();
    var trainTime = elTrainTime.val().trim();
    var firstTrain = moment(trainTime,"HH:mm").subtract(1,"years").format("X");

    console.log(trainName);
    console.log(destination);
    console.log(firstTrain);
    console.log(frequency); 
    

    //creating the object that stores the train data submitted
    var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
    }

    trainInfo.ref().push(newTrain);
    $("input[type=text], textarea").val("");

  }

  //Update TrainInfo function will update the HTML with the train details
  function updateTrainInfo(){

    //refrence to the firebase data when database changes
    trainInfo.ref().on("value", function(snapshot) {

           //Remove all the rows , this is neccessary to reinitialize ths HTML with latest train details
            $("#trainRow").find("tr").remove();

            snapshot.forEach(function(childSnapshot) {
                // Get the unique TrainId to set as attr for edit and trash icons
                var trainId = childSnapshot.key;
                
                var name = childSnapshot.val().name;
                var destination = childSnapshot.val().destination;
                var frequency = childSnapshot.val().frequency;
                var firstTrain = childSnapshot.val().firstTrain;

                var remainder = moment().diff(moment.unix(firstTrain),"minutes") % frequency;
                var minutes = frequency - remainder;
                var arrival = moment().add(minutes,"m").format("hh:mm A");

                //append data to the columns to display the schedule created from the submitted data stored on firebase
                $("#trainRow").append("<tr><td>"+ name+ "</td><td>"+ destination +
                "</td><td>"+ frequency +"</td><td>"+ arrival+
                "</td><td>" + minutes + "</td><td>" + 
                "<i><span class='far fa-edit'data-edit-icon=" + trainId + "></span></i>" +"</td><td>" + 
                "<i><span class='fas fa-trash' data-trash-icon=" + trainId + "></span></i>" + "</td></tr>"
                );


                $("span").hide();

                // Hover view of delete or edit button
                $("tr").hover(
                    function() {
                        $(this).find("span").show();
                    },
                    function() {
                        $(this).find("span").hide();
                    }
                );
            
              
                
            });
    });
}
//function to start timer
function startTimer() {
    timer = setInterval(function() {  
        updateTrainInfo();
    }, 60000);
}

//function to stop timer
function stopTimer() {
    clearInterval(timer);
}
$( document ).ready(function() {
    
    updateTrainInfo();
    startTimer();
});
// BONUS to Remove Train
$("#trainRow").on("click", ".fa-trash", function() {
    var confirmDelete = confirm("Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?");
    if(confirmDelete)
    {
    var trainId = $(this).attr("data-trash-icon")
    var refTrain = trainInfo.ref(trainId); //
    refTrain.remove();
    }
});
// BONUS to Edit Train Details
$("#trainRow").on("click", ".fa-edit", function() {
    console.log(this);
   
});


   