$(document).ready(function() {
    const display = document.querySelector('#account');
    const dashboard = document.querySelector('#dashboard');
    const dashboardsection1 = document.getElementById('dashboardsection1');
    const dashboardsection2 = document.getElementById('dashboardsection2');
    $('#loginsubmit').on('click', function(event) {

        $.ajax({
            data: {
                usersignin: $('#usersignin').val(),
                passwordsignin: $('#passwordsignin').val()
            },
            type : 'POST',
            url : '/signin'
        })

        .done(async function(data) {
            // console.log(data);
            if (data.error) {
                // $('#error').text(data["message"]).show();
                document.getElementById('signinerror').innerHTML = data;
                // document.getElementById('dashboardsection1').innerHTML = "fvhojfdoij";
            }
            else if (data["status"] == false) {
                document.getElementById('signinerror').innerHTML = data;
            }
            else if (data["status"]) {
                document.querySelector('#accountbtn').style.display = "none";
                document.querySelector('#dashboardswitch').style.display = "flex";
                // document.querySelector('#dashboardbtn2').style.display = "flex";

                document.querySelector('.account').classList.remove('expand');
                document.querySelector('.dashboard').classList.add('expand');
                document.getElementById('accountname').innerHTML = data["fullname"];
                document.getElementById('accountmessage').innerHTML = data["message"];
                const profileimage = data["profileimage"];
                // console.log(profileimage);
                document.getElementById('profile-picture-wrapper').innerHTML = `<img src="${profileimage}" height="100%" width="100%" class="profile-picture"></img>`;
                document.getElementById('dashboardswitch').innerHTML = `<div class="profile-picture-wrapper2"><img src="${profileimage}" height="100%" width="100%" class="profile-picture"></img></div>`;
                // document.getElementById('dashboardbtn2').innerHTML = `<div class="profile-picture-wrapper3"><img src="${profileimage}" height="100%" width="100%" class="profile-picture"></img></div>`;
                // document.getElementById('accountbtn2').innerHTML = `<div class="profile-picture-wrapper3"><img src="${profileimage}" height="100%" width="100%" class="profile-picture"></img></div>`;
                if (data["profileimage"] === "static/images/defaultprofilepicture.png")
                {
                    // document.querySelector('.profile-picture-wrapper').style.padding = "9px";
                    document.querySelector('.profilepicture').style.padding = "9px";
                    document.querySelector('.profile-picture-wrapper2').style.padding = "2.4px";
                    // document.querySelector('.profile-picture-wrapper3').style.padding = "2.4px";
                }
                document.getElementById('membershipstatus').innerHTML = data["membership"];
                document.getElementById('membershipstatus2').innerHTML = data["membership"];
                // document.getElementById('membershipstatus').innerHTML = data["notifications"][0];




                document.getElementById('fullnameupdate').placeholder = data["fullname"];
                document.getElementById('phonenumberupdate').placeholder = data["phonenumber"];
                document.getElementById('emailupdate').placeholder = data["email"];
                document.getElementById('addressupdate').placeholder = data["address"];
                // document.getElementById('profilepictureupdate').placeholder = data["profileimage"];
                if (data["admin"] === 1)
                {
                    document.querySelector('#dashboardsection10').style.display = 'grid';
                    const userdata = data["userdata"];
                    // console.log(data);
                    // const fdata = JSON.parse(data["messagehistory"]);
                    // console.log(fdata["chatrooms"]);
                    const listContainer = document.getElementById('userselector');
                    userdata.forEach(user => {
                        const option = document.createElement('option');
                        option.textContent = user["fullname"];
                        option.value = user["fullname"];
                        listContainer.appendChild(option);
                    });
                    // console.log(data["messagehistory"]["chatrooms"]);
                    const listContainer2 = document.getElementById('userselector');

                    const userdisplay = document.getElementById('displayuser');
                    // console.log(selecteduser);
                    listContainer2.addEventListener('change', function(event) {
                        // const selecteduser = document.getElementById('userselector').value;
                        const selecteduser = event.target.value;
                        const dataindex = userdata.findIndex(user => user.fullname === selecteduser);
                        // console.log(dataindex);
                        if (selecteduser === 'Select User'){
                            userdisplay.innerHTML = '';
                        }
                        else{
                            userdisplay.innerHTML = `
                                <br>
                                id: ${data["userdata"][dataindex]["id"]}<br>
                                full name: ${data["userdata"][dataindex]["fullname"]}<br>
                                email: ${data["userdata"][dataindex]["email"]}<br>
                                phone number: ${data["userdata"][dataindex]["phonenumber"]}<br>
                                address: ${data["userdata"][dataindex]["address"]}<br>
                                password: ${data["userdata"][dataindex]["password"]}`;
                        }
                    });

                    // const adminexistingchatform = document.getElementById('adminexistingchatform');
                    // const usermessagehistory = data["userdata"];
                    //     // const fhistory = JSON.parse(data["messagehistory"]);
                    //     // const fchatrooms = fhistory["chatrooms"];
                    //     // console.log(fchatrooms);
                    // userdata.forEach(user => {
                    //     const fhistory = JSON.parse(user["messagehistory"]);
                    //     // const fchatrooms = JSON.parse(fhistory["chatrooms"]);
                    //     // const schatrooms = JSON.stringify(fhistory["chatrooms"]);
                    //     // const fchatrooms = JSON.parse(schatrooms);
                    //     const fchatrooms = fhistory["chatrooms"];
                    //     // const fc = JSON.stringify(fchatrooms)
                    //     // console.log(typeof user["messagehistory"]);
                    //     // console.log(fhistory);
                    //     // console.log(fchatrooms);
                    //     // console.log(typeof fchatrooms);
                    //     // console.log(fhistory["chatrooms"]);
                    //     // console.log(fhistory["chatrooms"].FL1Q0001);
                    //     Object.keys(fchatrooms).forEach(chatroom => {
                    //         // adminchatdisplay.innerHTML = fhistory
                    //         const adminchatitem = document.createElement('div');
                    //         // chatitem.type = "button";
                    //         // chatitem.value = chatroom;
                    //         // chatitem.name = chatroom;
                    //         // chatitem.id = 'existingchat';
                    //         // chatitem.textContent = "Click Me!";
                    //         // chatitem.class = 'existingchat';

                    //         // const fchatroom = JSON.stringify(chatroom);
                    //         // console.log(fchatrooms[chatroom]);
                    //         adminchatitem.innerHTML = `
                    //             <button class="adminmessagewindowitem hover3" value="${chatroom}" type="submit" style="color:pink; stroke:pink; fill: pink;">
                    //                 <div style="grid-area:messageitem-1; align-self:center; padding-left:4px;margin-right: 11px">
                    //                     <svg viewBox="0 0 24 24" id="Layer_1" height="42px" width="42px" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;stroke:#020202;stroke-miterlimit:10;stroke-width:1.91px;}</style></defs><path class="cls-1" d="M18.68,8.16V15.8a2.86,2.86,0,0,1-2.86,2.86H13.91v2.86L8.18,18.66H4.36A2.86,2.86,0,0,1,1.5,15.8V8.16A2.86,2.86,0,0,1,4.36,5.3H15.82A2.86,2.86,0,0,1,18.68,8.16Z"></path><path class="cls-1" d="M18.68,14.84h1A2.86,2.86,0,0,0,22.5,12V4.34a2.86,2.86,0,0,0-2.86-2.86H8.18A2.86,2.86,0,0,0,5.32,4.34v1"></path><line class="cls-1" x1="5.32" y1="11.98" x2="7.23" y2="11.98"></line><line class="cls-1" x1="9.14" y1="11.98" x2="11.05" y2="11.98"></line><line class="cls-1" x1="12.95" y1="11.98" x2="14.86" y2="11.98"></line></g></svg>
                    //                 </div>
                    //                 <div style="grid-area:messageitem-2;">
                    //                     <p style="justify-self:left; font-size:.94rem; margin-bottom:-9px;"><b>Chat ID: ${chatroom}</b></p>
                    //                     <p style="font-size:.69rem;padding-right:9px;font-family: 'Nunito'">Need help booking or choosing a set?</p>
                    //                 </div>
                    //             </button>
                    //         `;
                    //         adminexistingchatform.appendChild(adminchatitem);
                    //     });
                    // });
                }
            }
            else {
                document.getElementById('signinerror').innerHTML = data;
            }
        })

        event.preventDefault();

    });


    // $('#dashboardbtn').on('click', function(event) {
    //     // document.querySelector('.dashboard').classList.add('expand');
    //     document.querySelector('.dashboard').classList.add('expand');
    //     // document.getElementById('dashboard').style.display = "grid";
    //     event.preventDefault();
    // });



    // $('#changepasswordbtn').on('click', function(event) {
    //     // document.querySelector('#changepasswordsection').style.display = "grid";
    //     document.querySelector('#changepasswordsection').style.height = "fit-content";
    //     // profiledisplay.style.display = 'grid';
    // });



    $('#dashboardsection2').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.toggle('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection3').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.toggle('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection4').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.toggle('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection5').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.toggle('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection6').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.toggle('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection7').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.toggle('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection8').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.toggle('expand');
        document.querySelector('#admindisplay').classList.remove('expand');
        // profiledisplay.style.display = 'grid';
    });
    $('#dashboardsection10').on('click', function(event) {
        document.querySelector('#profiledisplay').classList.remove('expand');
        document.querySelector('#membershipdisplay').classList.remove('expand');
        document.querySelector('#cartdisplay').classList.remove('expand');
        document.querySelector('#calendardisplay').classList.remove('expand');
        document.querySelector('#historydisplay').classList.remove('expand');
        document.querySelector('#settingsdisplay').classList.remove('expand');
        document.querySelector('#signoutdisplay').classList.remove('expand');
        document.querySelector('#admindisplay').classList.toggle('expand');
        // profiledisplay.style.display = 'grid';
    });
//     $('#dashboardsection9').on('click', function(event) {
//         document.querySelector('#profiledisplay').classList.remove('expand');
//         document.querySelector('#membershipdisplay').classList.remove('expand');
//         document.querySelector('#cartdisplay').classList.remove('expand');
//         document.querySelector('#calendardisplay').classList.remove('expand');
//         document.querySelector('#historydisplay').classList.remove('expand');
//         document.querySelector('#settingsdisplay').classList.remove('expand');
//         document.querySelector('#signoutdisplay').classList.remove('expand');
//         document.querySelector('#admindisplay').classList.toggle('expand');
//         // profiledisplay.style.display = 'grid';
//     });
});
