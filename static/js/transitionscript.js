document.addEventListener('DOMContentLoaded', function(){


    // reveal on scroll
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, {threshold: 0.12});
        reveals.forEach(function(r){ obs.observe(r); });
    } else {
        // fallback
        reveals.forEach(function(r){ r.classList.add('in-view'); });
    };


    document.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const revealElements = document.querySelectorAll('.grow-on-scroll');

        revealElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top + scrollPosition;
            const distance = Math.abs(scrollPosition - elementPosition);
            const scale = 1 + Math.min(distance / 500, 0.2); // Adjust the divisor for sensitivity

            element.style.transform = `scale(${scale})`;
            });
    });





    const header = document.querySelector('header');
    const headerpadding = document.querySelector('.header-padding');
    const messengerswitch = document.querySelector('.messengerswitch');
    const messengerwindow = document.querySelector('.messengerwindow');
    const messengerwindowclosebutton = document.querySelector('.messengertools-closemessenger-btn');

    window.addEventListener('scroll', () => {
        const bannerimage = document.querySelector('.bannerimage').getBoundingClientRect();
        if (window.scrollY > 24) {
            header.classList.add('scrolled');
            if (!messengerwindow.classList.contains('active')) {
                messengerswitch.classList.add('visible');
            }
            if (window.scrollY > bannerimage.height) {
                headerpadding.classList.add('scrolled');
            }
            else {
                headerpadding.classList.remove('scrolled');
            }
        }
        else {
            header.classList.remove('scrolled');
            messengerswitch.classList.remove('visible');
        }
    });

    const toolscartbtn = document.querySelector(".tools-cartbtn");
    const toolscartdisplay = document.querySelector(".tools-cart-display");
    let hovertimer;
    const delay = 2400;

    [toolscartbtn, toolscartdisplay].forEach(target => {
        target.addEventListener("mouseenter", () => {
            // setTimeout(() => {
                close_other_elements([toolscartdisplay, messengerswitch]);
                clearTimeout(hovertimer);
                toolscartdisplay.classList.add('active');
            // }, 200);
        });
        target.addEventListener("mouseleave", () => {
            hovertimer = setTimeout(() => {
                toolscartdisplay.classList.remove('active');
            }, delay);
        });
    });


    const allElements = document.querySelectorAll('*');

    const morebtn = document.querySelector('.navigation-morebtn');
    const moremenu = document.querySelector('.navigation-morebtn-menu');
    const arrow = document.querySelector('.arrow');

    const dropdownbtn = document.querySelector('.tools-dropdownbtn');
    const dropdownmenu = document.querySelector('.tools-dropdownbtn-menu');
    const svgrotate = document.querySelector('.svgrotate');

    const accountswitches = document.querySelectorAll('.accountswitch');
    const accountwindow = document.querySelector('.accountwindow');

    const dashboardswitches = document.querySelectorAll('.dashboardswitch');
    const dashboardwindows = document.querySelectorAll('.dashboardwindow');

    const searchswitches = document.querySelectorAll('.searchswitch');
    const searchwindow = document.querySelector('.searchwindow');

    const signincontainer = document.querySelector('.signincontainer');
    const registercontainer = document.querySelector('.registercontainer');
    const forgotpasswordcontainer = document.querySelector('.forgotpasswordcontainer');

    const loginbtn = document.querySelector('.login-btn');
    const loginsubmitbtns = document.querySelectorAll('.loginsubmit');
    const registerbtn = document.querySelector('.register-btn');
    const registrationsubmitbtns = document.querySelectorAll('.registrationsubmit');
    const forgotpasswordbtn = document.querySelector('.forgotpassword-btn');
    const forgotpasswordreturnbtn = document.querySelector('.forgotpassword-return-btn');


    function close_other_elements(targetElements) {
        allElements.forEach(element => {
            if (!targetElements.includes(element)) {
                element.classList.remove('active');
                // accountwindow.hidePopover();
            }
            if (messengerwindow.classList.contains('active')) {
                messengerswitch.classList.remove('visible');
            }
            if (!messengerwindow.classList.contains('active') && window.scrollY > 24) {
                messengerswitch.classList.add('visible');
            }
            // if (!accountwindow.style.display == 'none') {
            //     accountwindow.style.display = 'none';
            // }
        });
        event.stopImmediatePropagation();
    }

    document.addEventListener('click', function(event) {
        const messengerWindowParent = event.target.closest('.messengerwindow');
        const searchWindowParent = event.target.closest('.searchwindow');
        const dashboardWindowParent = event.target.closest('.dashboardwindow');
        close_other_elements([event.currentTarget, dashboardWindowParent, searchWindowParent, messengerWindowParent, messengerswitch]);
    });

    morebtn.addEventListener('click', function(event) {
        close_other_elements([morebtn, moremenu, arrow]);
        [morebtn, moremenu, arrow].forEach(target => {
            target.classList.toggle('active');
        });
    });

    dropdownbtn.addEventListener('click', function(event) {
        close_other_elements([dropdownbtn, dropdownmenu, svgrotate]);
        [dropdownbtn, dropdownmenu, svgrotate].forEach(target => {
            target.classList.toggle('active');
        });
    });

    accountswitches.forEach (accountswitch => {
        accountswitch.addEventListener('click', function(event) {
            close_other_elements([]);
            // close_other_elements([accountwindow]);
            // accountwindow.classList.toggle('active');
        });
    });

    dashboardswitches.forEach (dashboardswitch => {
        dashboardswitch.addEventListener('click', function(event) {

            dashboardwindows.forEach (dashboardwindow => {
                close_other_elements([dashboardwindow]);
                dashboardwindow.classList.toggle('active');
            });
        });
    });

    searchswitches.forEach (searchswitch => {
        searchswitch.addEventListener('click', function(event) {
            close_other_elements([searchwindow]);
            searchwindow.classList.toggle('active');
        });
    });

    messengerswitch.addEventListener('click', function(event) {
        close_other_elements([messengerwindow]);
        messengerwindow.classList.toggle('active');
        messengerswitch.classList.toggle('visible');
    });


    messengerwindowclosebutton.addEventListener('click', function(event) {
        messengerwindow.classList.toggle('active');
        messengerswitch.classList.toggle('visible');
    });

    registerbtn.addEventListener('click', function(event) {
        signincontainer.style.display = 'none';
        registercontainer.style.display = 'block';
    });
    loginbtn.addEventListener('click', function(event) {
        signincontainer.style.display = 'block';
        registercontainer.style.display = 'none';
    });
    forgotpasswordbtn.addEventListener('click', function(event) {
        forgotpasswordcontainer.style.display = 'inline-block';
        signincontainer.style.display = 'none';
        registercontainer.style.display = 'none';
    });
    forgotpasswordreturnbtn.addEventListener('click', function(event) {
        forgotpasswordcontainer.style.display = 'none';
        signincontainer.style.display = 'block';
        registercontainer.style.display = 'none';
    });


    // loginsubmitbtns.forEach (loginsubmitbtn => {
    //     loginsubmitbtn.addEventListener('click', function(event) {
    //         close_other_elements([]);
    //         // close_other_elements([accountwindow]);
    //         // accountwindow.classList.toggle('active');
    //     });
    // });

});
