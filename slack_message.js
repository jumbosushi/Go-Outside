var Slack = require('node-slack');
var slack = new Slack("https://hooks.slack.com/services/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");

// Joey's random talks
var shit_joey_say = {
    // found on http://iandolij.tumblr.com/post/50120585724/shit-hikers-say
    0: "Hike your own hike, man",
    1: "What’s your base weight",
    2: "How do you purify",
    3: "It’s smiles not miles",
    4: "No rain no pain no Maine",
    5: "How’s the water source look?",
    6: "How many miles you doing today",
    7: "Dang It smells like hiker in here",
    8: "How’s the privy look",
    9: "No bear cables?",
    10: "Duck the smokeys",
    11: "When’s the next resupply",
    12: "What day is it",
    13: "Tent or shelter",
    14: "Yo let's dig a hole",
    15: "What’s the weather look like today?",
    16: "Man I’m craving a burger",
    17: "First world problem",
    18: "COCONUT OIL. nuff said",
    19: "Skinny white guy with the beard",
    20: "You got a lighter",
    21: "Is that ultra light",
    22: "Fire drill",
    23: "How much weight you loose",
    24: "That’s an unsolicited pro-tip",
    25: "Who makes that",
    26: "White gas or alcohol",
    27: "Where’s the closest place I can get butter chicken",
    28: "We could hitch?",
    29: "I'm a professional zombie hunter \n Have you seen zombie recently? Yeah, you're welcome"
};

module.exports = {
// Slash commands
    slash: function (req, res) {

                var slash_text = req.body.text;
                // "login" - let the user log in
                if (slash_text == "login") {
                    user_name = req.body.user_name; // store the username temporally
                    user_id = req.body.user_id; // store the user_id temporally
                    slack.send({
                        text: "<https://lit-journey-12058.herokuapp.com/authorize_user|Join the party!>" +
                              "\n You'll need your insagram account."
                    });


                // "stats" - show the current standing of people in the game
                } else if (slash_text == "stats") {
                    for (id in users) {
                        slack.send({
                            text: users[id]["name"] + " has " + users[id]["score"] + " points!"
                        });
                    };


                // "coconut oil" - coconut oil
                } else if (slash_text == "coconut oil") {
                    slack.send({
                        text: "Now you're speaking my language :taco: :taco: :taco:"
                    });

                // "help" - explain the game
                } else if (slash_text == "help") {
                    slack.send({
                        text: "Hey there! This is yo boy Joey \n" +
                            "I will keep in track of how your team is " +
                            "doing in the Go Outside game :rocket: \n" +
                            "Here's how its played. Whenever you post a picture on Instagram, " +
                            "I'll check if you took \n"  +
                            "that picture outside. If you did, congrats! You get a point.\n" +
                            "Type '/go login' to get started!"
                    });

                // "talk" - Choose a random phrase from shit_joey_say
                } else if (slash_text == "talk") {
                    slack.send({
                        text: shit_joey_say[parseInt(Math.random() * 30)]
                    });

                // everything else
                } else {
                    slack.send({
                        text: "Hmm not sure what tag that is. You mean Bacon?"
                    });
                }
                res.end();
            })
}
