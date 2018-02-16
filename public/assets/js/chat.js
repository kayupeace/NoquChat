
$(function() {
    /**
     function switchRoom(room){
        roomid = room;
        socket.emit('switchRoom', room);
    }
     **/

    //var e = document.getElementById("roomid");
    //s = e.options[e.selectedIndex].value;

    //v = e.options[e.selectedIndex].label;
    //console.log(v);
    //j = e.options[e.selectedIndex].text;
    //console.log(s);
    /**
     e.onchange = function() {
        s = e.options[e.selectedIndex].value;
        console.log(s);
        switchRoom(s);
        //v = e.options[e.selectedIndex].label;
        //console.log(v);
        //j = e.options[e.selectedIndex].text;
        //console.log(j);
    };
     **/

    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    function setCookie(cname, cvalue, exdays) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    //console.log(getCookie("chatRoom"));
    //setCookie("nickName", "kevin", new Date() + 9999);
    //console.log(getCookie("nickName"));

    let FADE_TIME = 150; // ms
    let TYPING_TIMER_LENGTH = 400; // ms
    let COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    let $window = $(window);
    let $usernameInput = $('.usernameInput'); // Input for username
    let $messages = $('.messages'); // Messages area
    let $inputMessage = $('.inputMessage'); // Input message input box

    let $loginPage = $('.login.page'); // The login page
    let $chatPage = $('.chat.page'); // The chatroom page

    // Prompt for setting a username
    let username;

    let connected = false;
    let typing = false;
    let lastTypingTime;
    let $currentInput = $usernameInput.focus();

    let socket = io();

    function addParticipantsMessage (data) {
        let message = '';
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    // Sets the client's username
    function setUsername () {
        if(username){
            let data = {
                username: username,
                chatroom: getCookie("chatRoom")
            };
            setCookie("nickName", username, new Date() + 9999);
            socket.emit('add user', data);
        }else {
            username = cleanInput($usernameInput.val().trim());
            // If the username is valid
            if (username) {
                // Tell the server your username
                let data = {
                    username: username,
                    chatroom: getCookie("chatRoom")
                };
                setCookie("nickName", username, new Date() + 9999);
                socket.emit('add user', data);
            }
        }


    }

    // Sends a chat message
    function sendMessage () {
        //var message = $inputMessage.val();
        let message = $('#inputMessage').val();
        //console.log(message);
        // Prevent markup from being injected into the message
        // no need to prevent as input convert into text already
        //message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            // Clean user input filed
            //$inputMessage.text('');
            //addChatMessage({
            //    username: username,
            //    message: message
            //});
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
            //socket.emit("", message);

        }
    }

    // Log a message
    function log (message, options) {
        /**
            let $el = $('<li>').addClass('log').text(message);
            addMessageElement($el, options);
        **/
        let $el = $('<div class="alert alert-info msg-information">').text(message)
            addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage (data, options) {
        // Don't fade the message in if there is an 'X was typing'
        let $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        let $usernameDiv = $('<h6 class="media-heading"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));

        let $messageBodyContent = $('<small class="col-lg-10">')
            .text(data.message);

        let $profileImage= $('<img class="media-object" style="width: 32px; height: 32px;" src="/assets/img/profile_1.jpg">');
        let $profileBody = $('<a class="pull-left" href="#">')
            .append($profileImage);

            /**
        <a class="pull-left" href="#">
            <img class="media-object" data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src="/assets/img/profile_1.jpg">
        </a>
            **/

        let $messageBodyDiv = $('<div class="media-body message">')
            .append($usernameDiv,$messageBodyContent);

        let typingClass = data.typing ? 'typing' : '';
        //let $layout = $('<div class="media msg"/>')
        //    .append($messageBodyContent);

        let $messageDiv = $('<div class="media msg message msg-linebreak"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($profileBody,$messageBodyDiv);


/**
        <div class="media msg">
            <a class="pull-left" href="#">
                <img class="media-object" data-src="holder.js/64x64" alt="64x64" style="width: 32px; height: 32px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACqUlEQVR4Xu2Y60tiURTFl48STFJMwkQjUTDtixq+Av93P6iBJFTgg1JL8QWBGT4QfDX7gDIyNE3nEBO6D0Rh9+5z9rprr19dTa/XW2KHl4YFYAfwCHAG7HAGgkOQKcAUYAowBZgCO6wAY5AxyBhkDDIGdxgC/M8QY5AxyBhkDDIGGYM7rIAyBgeDAYrFIkajEYxGIwKBAA4PDzckpd+322243W54PJ5P5f6Omh9tqiTAfD5HNpuFVqvFyckJms0m9vf3EY/H1/u9vb0hn89jsVj8kwDfUfNviisJ8PLygru7O4TDYVgsFtDh9Xo9NBrNes9cLgeTybThgKenJ1SrVXGf1WoVDup2u4jFYhiPx1I1P7XVBxcoCVCr1UBfTqcTrVYLe3t7OD8/x/HxsdiOPqNGo9Eo0un02gHkBhJmuVzC7/fj5uYGXq8XZ2dnop5Mzf8iwMPDAxqNBmw2GxwOBx4fHzGdTpFMJkVzNB7UGAmSSqU2RoDmnETQ6XQiOyKRiHCOSk0ZEZQcUKlU8Pz8LA5vNptRr9eFCJQBFHq//szG5eWlGA1ywOnpqQhBapoWPfl+vw+fzweXyyU+U635VRGUBOh0OigUCggGg8IFK/teXV3h/v4ew+Hwj/OQU4gUq/w4ODgQrkkkEmKEVGp+tXm6XkkAOngmk4HBYBAjQA6gEKRmyOL05GnR99vbW9jtdjEGdP319bUIR8oA+pnG5OLiQoghU5OElFlKAtCGr6+vKJfLmEwm64aosd/XbDbbyIBSqSSeNKU+HXzlnFAohKOjI6maMs0rO0B20590n7IDflIzMmdhAfiNEL8R4jdC/EZIJj235R6mAFOAKcAUYApsS6LL9MEUYAowBZgCTAGZ9NyWe5gCTAGmAFOAKbAtiS7TB1Ng1ynwDkxRe58vH3FfAAAAAElFTkSuQmCC">
            </a>
            <div class="media-body">
                <small class="pull-right time"><i class="fa fa-clock-o"></i> 12:10am</small>
                <h6 class="media-heading">Naimish Sakhpara</h6>

                <small class="col-lg-10">Arnab Goswami: "Some people close to Congress Party and close to the government had a #secret #meeting in a farmhouse in Maharashtra in which Anna Hazare send some representatives and they had a meeting in the discussed how to go about this all fast and how eventually this will end."</small>
            </div>
        </div>
**/

        addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
        data.typing = true;
        data.message = "is typing";
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping (data) {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement (el, options) {
        let $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }

        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).html();
    }

    // Updates the typing event
    function updateTyping () {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                let typingTimer = (new Date()).getTime();
                let timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
        return $('.typing.message').filter(function (i) {
            return $(this).data('username') === data.username;
        });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
        // Compute hash code
        let hash = 7;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        let index = Math.abs(hash % COLORS.length);
        return "#003bb3";
        //return COLORS[index];
    }

    // pre-load event


    let nickName = getCookie("nickName");
    if(nickName === ""){

    }else {
        username = nickName;
        setUsername();
    }
    //console.log(getCookie("nickName"));

    // Keyboard events

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit('stop typing');
                typing = false;
            } else {
                setUsername();
            }
        }
    });
    $("#nickName").click(function(){
        //if (username) {
        //    alert('Already had a nickName and seems like your have trouble, contact to site manager')
        //} else {
        setUsername();
        // }
    });
    $("#message").click(function(){
        if (username) {
            sendMessage();
            socket.emit('stop typing');
            typing = false;
        } else {
            setUsername();
        }
    });
    $("#HideChat").click(function(){
        let isvisible = $("#ChatWindow").is(":visible");
        console.log(isvisible);
        if(isvisible){
            $("#ChatWindow").slideUp("slow");
        }else{
            $("#ChatWindow").slideDown("slow");
        }

    });


    $inputMessage.on('input', function() {
        updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login page
    //$loginPage.click(function () {
    //    $currentInput.focus();
    //});

    // Focus input when clicking on the message input's border
    //$inputMessage.click(function () {
    //    $inputMessage.focus();
    //});

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();

        connected = true;
        // Display the welcome message
        let message = "Welcome";
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    });

    socket.on('Invalid Room', function (data) {
        setCookie("chatRoomError", getCookie("chatRoom"), new Date() + 9999);
        //res.cookie('chatRoomError', room_id, {expire: new Date() + 9999});
        //console.log(getCookie("chatRoom"));
        let $usernameInput = $('#hint'); // Input for username
        $usernameInput.text('Invalid room id');
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
        //socket.on(roomid, function (data) {
        addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
        addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
        log(data.username + ' left');
        addParticipantsMessage(data);
        removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });

    socket.on('disconnect', function () {
        log('you have been disconnected');
    });

    socket.on('reconnect', function () {
        log('you have been reconnected');

        if (username) {
            setUsername();
        }
    });

    socket.on('reconnect_error', function () {
        log('attempt to reconnect has failed, if error still occur, try refresh page');
    });

    let limit = 1024;
    $('#inputMessage').keypress(function(event) {
        if(event.which === 13){  //prevent "enter" event on keyboard insert input
            return false;
        }
        return this.innerHTML.length < limit;
    }).on({
        'paste': function(e) {
            let len = this.innerHTML.length,
                cp = e.originalEvent.clipboardData.getData('text');
            if (len < limit)
                this.innerHTML += cp.substring(0, limit - len);
            return false;
        },
        'drop': function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

});