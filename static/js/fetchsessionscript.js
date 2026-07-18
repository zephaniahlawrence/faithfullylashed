$(document).ready(function() {
    fetch('/fetchsession')
    .then(response => response.json())

    .then(async function(data) {
        // console.log(data)
        // if (data) {
        //     return;
        // }
        if (data["ip"]) {
            console.log(data);
        }
        if (data.error) {
            $('#error').text(data.error).show();
        }
        if (data["status"] == false) {
            return;
        }
        if (data["status"]) {
            // console.log(document.querySelector('#dashboardswitch'));
            document.querySelector('#accountbtn').style.display = "none";
            document.querySelector('#sandwich1').style.display = "none";
            document.querySelector('#dashboardswitch').style.display = "flex";
            // document.querySelector('.dashboardswitch2').style.display = "flex";

            // document.querySelector('.account').classList.remove('expand');
            // document.querySelector('.dashboard').classList.add('expand');
            document.getElementById('accountname').innerHTML = data["fullname"];
            document.getElementById('accountmessage').innerHTML = data["message"];
            const profileimage = data["profileimage"];
            console.log(profileimage);
            document.getElementById('profilepicture').innerHTML = `<img src="${profileimage}" height="100%" width="100%" class="profilepicture">`;
            document.getElementById('dashboardswitch').innerHTML = `<img src="${profileimage}" height="100%" width="100%" class="profilepicture">`;
            // document.getElementById('dashboardswitch2').innerHTML = `<div class="profile-picture-wrapper3"><img src="${profileimage}" height="100%" width="100%" class="profile-picture"></img></div>`;
            // document.getElementById('accountbtn2').innerHTML = `<div class="profile-picture-wrapper3"><img src="${profileimage}" height="100%" width="100%" class="profile-picture"></img></div>`;
            if (data["profileimage"] === "static/images/defaultprofilepicture.png")
            {
                document.querySelector('.profilepicture').style.padding = "9px";
                // document.querySelector('.profile-picture-wrapper2').style.padding = "2.4px";
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
            // console.log("admin")
            // console.log(data["admin"])

            if (window.location.pathname.endsWith('/cart')) {
                // console.log(data);
                if (data["cart"] === "Your cart is empty.") {
                    const cartdisplay = document.getElementById('cartdisplay');
                    const cartmessage = document.getElementById('cartmessage');
                    document.getElementById('total').innerHTML = "Total: $0";
                    cartdisplay.innerHTML = "";
                    cartmessage.innerHTML = data["cart"];
                }
                if (data["cart"] != "Your cart is empty.") {
                    const cart = data["cart"];
                    const formattedcart = cart.replaceAll("'", '"');
                    const cartinfo = JSON.parse(formattedcart);
                    console.log(cartinfo);

                    const cartmessage = document.getElementById('cartmessage');
                    cartmessage.innerHTML = "";

                    const cartdisplay = document.getElementById('cartdisplay');
                    document.getElementById('total').innerHTML = `Total: $${cartinfo["total"]}`;

                    for (const service of cartinfo["cart"]) {
                        const serviceid = document.getElementById(service["serviceid"]);
                        if (cartdisplay.contains(serviceid)){
                            serviceid.innerHTML = `${service["name"]}: ${service["quantity"]} orders x $${service["price"]} - Subtotal: $${service["subtotal"]}`;
                        }
                        if (!cartdisplay.contains(serviceid)){
                            const div = document.createElement('div');
                            div.innerHTML = `${service["name"]}: ${service["quantity"]} orders x $${service["price"]} - Subtotal: $${service["subtotal"]}`;
                            div.id = service["serviceid"];
                            cartdisplay.appendChild(div);
                        }
                    }

                }
            }



            if (data["admin"] === 1) {
                // console.log("admin");
                document.querySelector('#dashboardsection10').style.display = 'grid';
                const userdata = data["userdata"];
                const listContainer = document.getElementById('userselector');
                    // Object.values(userdata).forEach(user => {
                    //     console.log(`user ${user.user.fullname}`);
                    // });
                Object.values(userdata).forEach(user => {
                    // console.log(`user ${JSON.stringify(user)}`);
                    const option = document.createElement('option');
                    option.textContent = user["user"]["fullname"];
                    option.value = user["user"]["fullname"];
                    listContainer.appendChild(option);
                });

                const listContainer2 = document.getElementById('userselector');

                const userdisplay = document.getElementById('displayuser');
                // console.log(selecteduser);
                listContainer2.addEventListener('change', function(event) {
                    // const selecteduser = document.getElementById('userselector').value;
                    const selecteduser = event.target.value;
                    const dataindex = Object.values(userdata).findIndex(user => user.user.fullname === selecteduser);
                    // console.log(dataindex);
                    if (selecteduser === 'Select User'){
                        userdisplay.innerHTML = '';
                    }
                    else{
                        userdisplay.innerHTML = `
                            <br>
                            id: ${data["userdata"][dataindex]["user"]["id"]}<br>
                            full name: ${data["userdata"][dataindex]["user"]["fullname"]}<br>
                            email: ${data["userdata"][dataindex]["user"]["email"]}<br>
                            phone number: ${data["userdata"][dataindex]["user"]["phonenumber"]}<br>
                            address: ${data["userdata"][dataindex]["user"]["address"]}<br>
                            password: ${data["userdata"][dataindex]["user"]["password"]}`;
                    }
                });



                const adminexistingchatform = document.getElementById('adminexistingchatform');
                const usermessagehistory = data["userdata"];

                // console.log(usermessagehistory);

                Object.values(userdata).forEach(user => {

                    console.log(user);

                    const messagehistory = JSON.parse(user["user"]["messagehistory"]);
                    Object.values(messagehistory).forEach(chatroom => {
                        if (chatroom["roomstatus"]) {
                            // console.log(chatroom["roominfo"]["roomcode"]);
                            const adminchatitem = document.createElement('div');
                            const xchatinfo = JSON.stringify({"userid": user["userid"], "roomcode": chatroom["roominfo"]["roomcode"]});
                            const chatinfo = {"userid": user["userid"], "roomcode": chatroom["roominfo"]["roomcode"]};
                            // console.log(`xchatinfo: ${xchatinfo}`);

                            adminchatitem.innerHTML = `
                                <button id="${chatroom}" name="${chatroom}" class="adminmessagewindowitem hover3" value="${xchatinfo}" data-chatinfo='${xchatinfo}' type="submit" style="color:pink; stroke:pink; fill: pink;">
                                    <div style="grid-area:messageitem-1; align-self:center; padding-left:4px;margin-right: 11px">
                                        <svg viewBox="0 0 24 24" id="Layer_1" height="42px" width="42px" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;stroke:#020202;stroke-miterlimit:10;stroke-width:1.91px;}</style></defs><path class="cls-1" d="M18.68,8.16V15.8a2.86,2.86,0,0,1-2.86,2.86H13.91v2.86L8.18,18.66H4.36A2.86,2.86,0,0,1,1.5,15.8V8.16A2.86,2.86,0,0,1,4.36,5.3H15.82A2.86,2.86,0,0,1,18.68,8.16Z"></path><path class="cls-1" d="M18.68,14.84h1A2.86,2.86,0,0,0,22.5,12V4.34a2.86,2.86,0,0,0-2.86-2.86H8.18A2.86,2.86,0,0,0,5.32,4.34v1"></path><line class="cls-1" x1="5.32" y1="11.98" x2="7.23" y2="11.98"></line><line class="cls-1" x1="9.14" y1="11.98" x2="11.05" y2="11.98"></line><line class="cls-1" x1="12.95" y1="11.98" x2="14.86" y2="11.98"></line></g></svg>
                                    </div>
                                    <div style="grid-area:messageitem-2;">
                                        <p style="justify-self:left; font-size:.94rem; margin-bottom:-9px;"><b>Chat ID: ${chatinfo["roomcode"]}</b></p>
                                        <p style="font-size:.69rem;padding-right:9px;font-family: 'Nunito'">Need help booking or choosing a set?</p>
                                    </div>
                                </button>
                            `;
                            adminexistingchatform.appendChild(adminchatitem);
                        }
                    });
                });

            }

        }
    });


});


