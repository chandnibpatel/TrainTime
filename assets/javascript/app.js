var config = {
    apiKey: "AIzaSyAWIx3G3QTGS7v4WKKLbwPJSgKWTc4pXI4",
    authDomain: "traintime-caad6.firebaseapp.com",
    databaseURL: "https://traintime-caad6.firebaseio.com",
    projectId: "traintime-caad6",
    storageBucket: "traintime-caad6.appspot.com",
    messagingSenderId: "444504554488"
  };
  firebase.initializeApp(config);

  //****************************************************************************
  // Variable declarations
  //****************************************************************************
  var signIn ="";

  // Reference to a firebase database
  var trainInfo = firebase.database();

  // jQuery global variables
  var elTrain = $("#nameInput");
  var elTrainDestination = $("#destinationInput");

  // form validation for Time using jQuery Mask plugin
  var elTrainTime = $("#firstTrainInput");
  var elTimeFreq = $("#frequencyInput");

  
  //****************************************************************************
  // Authentication with google login
  //**************************************************************************** 
  function login(){
      console.log("IN Login");
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
            //  firebase.auth().signInWithRedirect(provider);
            firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            console.log(result);
            // The signed-in user info.
            var user = result.user;

            // add a user to local storage on successful login
            localStorage.setItem('userDetail', JSON.stringify(user))
            updateTrainInfo();
            
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
  }

  
  //****************************************************************************
  //calls StoreInDatabase to add train details if submit button is being clicked
  //****************************************************************************

  $("#submitBtn").on("click", function(){
  
    // form validation - if empty - alert
    if (elTrain.val().length === 0 || elTrainDestination.val().length === 0 || elTrainTime.val().length === 0 || elTimeFreq.val().length === 0) {
        alert("Please Fill All Required Fields");
    } else {
        // if form is filled out, run function
        storeInDatabase(event);
    }
  });

  //****************************************************************************
  // Calls storeInputs function if enter key is clicked
  //****************************************************************************
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


  //****************************************************************************
  // StoreInDatabase to add train details to the firebase database
  //****************************************************************************

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

  //****************************************************************************
  //Update TrainInfo function will update the HTML with the train details
  //****************************************************************************

  function updateTrainInfo(){

    // Get the user login detail from the local storage
    signIn =JSON.parse(localStorage.getItem('userDetail'));

    // return back if user is not signin
   if (signIn==null) return;

   //displayig the user name after sign in
   $("#loginUser").append(signIn.displayName);

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
                $("#trainRow").append("<tr><td class='row_data'>"+ name+ "</td><td class='row_data'>"+ destination +
                "</td><td class='row_data'>"+ frequency +"</td><td class='row_data'>"+ arrival+
                "</td><td class='row_data'>" + minutes + "</td><td>" + 
                "<i><span class='fas fa-trash' data-trash-icon=" + trainId + "></span></i>" + "</td><td>" +
                "<i><span class='far fa-edit'data-edit-icon=" + trainId + "></span></i>" +"</td><td>"  +
                "<i><span class='far fa-save hiddenBtn' data-save-icon=" + trainId + "></span> </i>"  + "</td><td>" +
                "<i><span class='fas fa-undo hiddenBtn' data-undo-icon=" + trainId + "></span> </i>"  + "</td></tr>"
              
                );
                $(".fa-save").hide();
                $(".fa-undo").hide();             
                
            });
    });
}


//****************************************************************************
//function to start timer
//****************************************************************************
function startTimer() {
    timer = setInterval(function() {  
        updateTrainInfo();
    }, 60000);
}

//****************************************************************************
//function to stop timer
//****************************************************************************
function stopTimer() {
    clearInterval(timer);
}

//****************************************************************************
// Main Process
//****************************************************************************
$( document ).ready(function() {
    signIn=JSON.parse(localStorage.getItem('userDetail'));
    console.log(signIn);
    if(signIn===null){login();}

   
    updateTrainInfo();
    startTimer();

});

//****************************************************************************
// BONUS to Remove Train
//****************************************************************************
$("#trainRow").on("click", ".fa-trash", function() {
    var confirmDelete = confirm("Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?");
    if(confirmDelete)
    {
    var trainId = $(this).attr("data-trash-icon")
    var refTrain = trainInfo.ref(trainId); //
    refTrain.remove();
    }
});
//****************************************************************************
// BONUS to Edit Train Details
//****************************************************************************
$("#trainRow").on("click", ".fa-edit", function() {
    console.log(this);
    var tbl_row =$(this).closest('tr');

   
        tbl_row.find(".fa-save").show();
        tbl_row.find(".fa-undo").show();
        tbl_row.find(".fa-edit").hide();
    

    //make div editable
    $(this).closest('div').attr('contenteditable', 'true');
   
    //add bg css
    $(tbl_row).addClass('bg-dark').css('padding','5px');
    
    $(tbl_row).focus();
});
//****************************************************************************
// Save edited Row records on save icon click
//****************************************************************************
$("#trainRow").on("click", ".fa-save", function() {
  
    var tbl_row =$(this).closest('tr');
    var trainId = $(this).attr("data-save-icon")
   
    var arr = {}; 
    var i=0;
	tbl_row.find('.row_data').each(function(index, val) 
	{  
		var col_name = i;  
		var col_val  =  $(this).html();
        arr[col_name] = col_val;
        i=i+1;
    });
    console.log(arr[0]);

   

    var newTrain = {
        name: arr[0],
        destination: arr[1],
        firstTrain:  moment(convertTime12to24(arr[3]),"HH:mm").subtract(1,"years").format("X"),
        frequency: arr[2]
        }
      
       trainInfo.ref(trainId).set(newTrain);

        
        updateTrainInfo();
        tbl_row.find(".fa-save").hide();
        tbl_row.find(".fa-undo").hide();
        tbl_row.find(".fa-edit").show();

        //make div uneditable 
        $(this).closest('div').attr('contenteditable', 'false');

        //Remove Class and CSS
        tbl_row.find('#trainRow').removeClass('bg-dark').css('padding','')
    
});

//****************************************************************************
//To Undo the edited Row records
//****************************************************************************
$("#trainRow").on("click", ".fa-undo", function() {
  
    var tbl_row =$(this).closest('tr');

        tbl_row.find(".fa-save").hide();
        tbl_row.find(".fa-undo").hide();
        tbl_row.find(".fa-edit").show();

        //make div uneditable 
     $(this).closest('div').attr('contenteditable', 'false');
     //Remove Class and CSS
     tbl_row.find('#trainRow').removeClass('bg-dark').css('padding','')
     updateTrainInfo();
  
});

//****************************************************************************
//Convert time to military time formate 
//****************************************************************************
function convertTime12to24(time12h) {
    const [time, modifier] = time12h.split(' ');
  
    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
  
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
  
    return hours + ':' + minutes;
  }