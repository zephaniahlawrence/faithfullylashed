$(document).ready(function() {
    const loginsubmitbtns = document.querySelectorAll('.loginsubmit');
    const accountswitches = document.querySelectorAll('.accountswitch');
    const dashboardswitches = document.querySelectorAll('.dashboardswitch');
    const toolsdropdownbtn = document.querySelectorAll('.tools-dropdownbtn');

    const accountwindow = document.querySelectorAll('.accountwindow');
    const dashboardwindow = document.querySelectorAll('.dashboardwindow');
    const dashboarddisplays = document.querySelectorAll('.dashboard-display');
    const dashboardnavigationsections = document.querySelectorAll('.dashboard-navigation-section');

    const accountname = document.querySelectorAll('.dashboard-header-accountname');
    const accountmessage = document.querySelectorAll('.dashboard-header-accountmessage');
    const profileimage = document.querySelectorAll('.profileimage');
    const membershipstatus = document.querySelectorAll('.dashboard-header-membershipstatus');

    const fullnameupdate = document.querySelectorAll('.fullnameupdate');
    const phonenumberupdate = document.querySelectorAll('.phonenumberupdate');
    const emailupdate = document.querySelectorAll('.emailupdate');
    const addressupdate = document.querySelectorAll('.addressupdate');
    const profileimageupdate = document.querySelectorAll('.profileimageupdate');

    const signinerror = document.querySelectorAll('.signinerror');
    const registrationerror = document.querySelectorAll('.registrationerror');

    function change_class_style(targetclass, attribute, value) {
        targetclass.forEach(target => {
            target.style[attribute] = `${value}`;
        });
    }

    function change_class_attribute(targetclass, attribute, value) {
        targetclass.forEach(target => {
            target[attribute] = `${value}`;
        });
    }

    function change_class_classlist(targetclass, attribute, value) {
        targetclass.forEach(target => {
            target.classList[attribute](`${value}`);
        });
    }


    function toggle_dashboard_sections(targetwindow) {
        dashboarddisplays.forEach(dashboarddisplay => {
            if (dashboarddisplay.id != targetwindow) {
                dashboarddisplay.style.display = 'none';
            }
            else {
                dashboarddisplay.style.display = 'grid';
            }
        });
    }

    dashboardnavigationsections.forEach(dashboardnavigationsection => {
        $(dashboardnavigationsection).on('click', function(event) {
            const targetwindow = event.currentTarget.dataset.window;
            // console.log(targetwindow);
            toggle_dashboard_sections(targetwindow);
        });
    });


    $('.loginsubmit').on('click', function(event) {
        // event.preventDefault();

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
                change_class_attribute(signinerror, 'innerHTML', data);
            }
            else if (data["status"] == false) {
                change_class_attribute(signinerror, 'innerHTML', data);
            }
            else if (data["status"]) {
                change_class_style(accountswitches, 'display', 'none');
                change_class_style(dashboardswitches, 'display', 'grid');
                change_class_style(accountwindow, 'display', 'none');
                // change_class_style(dashboardwindow, 'display', 'grid');
                change_class_classlist(dashboardwindow, 'toggle', 'active');

                const dataimports = [accountname, accountmessage, membershipstatus, profileimage]
                dataimports.forEach(dataimport => {
                    // console.log(dataimport);
                    const datalocation = dataimport[0].dataset.databasekey;
                    change_class_attribute(dataimport, 'innerHTML', data[`${datalocation}`]);
                })

                const placeholderfields = [fullnameupdate, phonenumberupdate, emailupdate, addressupdate, profileimageupdate];
                placeholderfields.forEach(placeholderfield => {
                    // console.log(placeholderfield);
                    const datalocation = placeholderfield[0].dataset.databasekey;
                    change_class_attribute(placeholderfield, 'placeholder', data[`${datalocation}`]);
                })
                // document.getElementById('membershipstatus').innerHTML = data["notifications"][0];

                if (profileimage === "static/images/defaultprofilepicture.png")
                {
                    // document.querySelector('.profile-picture-wrapper').style.padding = "9px";
                    // document.querySelector('.profilepicture').style.padding = "9px";
                    // document.querySelector('.profile-picture-wrapper2').style.padding = "2.4px";
                    // document.querySelector('.profile-picture-wrapper3').style.padding = "2.4px";
                }



                if (data["admin"] === 1)
                {
                    const adminbtnsections = document.querySelectorAll('.dashboard-navigation-admin');
                    change_class_style(adminbtnsections, 'display', 'grid');

                    const userdata = data["userdata"];

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

                }
            }
            else {
                document.getElementById('signinerror').innerHTML = data;
            }
        })

        event.preventDefault();

    });


});
