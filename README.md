# Go-Outside
[Slack](slack.com) slash command that makes sure your teammates go outside!

Joey (the bot) plays the game called "Go Outside"
The player who earns the most point by going outside wins!

![Go Outside -help call](https://i.imgur.com/6W5xHzW.png)

Build w/ Express.js, and these notable add-ons:

* [instagram-node](https://www.npmjs.com/package/instagram-node)
* [node-slack](https://www.npmjs.com/package/node-slack)
* @cassidoo's [clarifai-javascript-starter](https://github.com/cassidoo/clarifai-javascript-starter)

# Table of Contents
1. [Usage](#usage)
2. [Installation](#installation)
3. [Issues](#issues)
4. [License](#license)
5. [Todo](#todo)


# Usage

1. [Install](#Installation) Go Outside slash command to your slack team
2.  Call ```/go login```  in slack to allow the app to get access to your Instagram account
3. Post a new picture on Instagram
4. If the picture was taken outside, you get a point!

Built-in Slach command tags:

*  ```/go help``` - post message containing the user guide
*  ```/go login``` - post link to Instagram login
*  ```/go stats``` - showts the current points standing
*  ```/go talk``` - bot post a random message
*  ```/go coconut oil``` - secret command

# Installation

Deploy it first!
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](hhttps://heroku.com/deploy?template=https://github.com/jumbosushi/Go-Outside)

You need to do three super easy things:

1. Add  ```/go``` slash command (stands for Go Outside)
2. Configure Incoming Webhook integration on slack
3. Add API token to app.js

## Adding Slack Command

Start by going to your team's App integration page

![team_meanu](https://i.imgur.com/9sbP3DT.png)

Clink the "Build your own" button on the top right, and go to "Make a custom Integration"


![Configure_APP](http://i.imgur.com/4xSt8S9.png)

Choose Slash Commands

Click on "Add Configuration" button


![Add Configuration](http://i.imgur.com/mwPIcge.png)

Let the slash command be ```/go``` (or command of your choice)

Once you go to Integration Setting,

* Change the URL to **https://YOUR_URL.herokuapp.com/slash**
* Change method to POST

![/go_setting](http://i.imgur.com/aVqUJha.png)

Put the name, icon, help text of your choice.
Now you have a (almost) working slash command!

![Joey_setting](http://i.imgur.com/um0CtBc.png)


## Configure Incoming Webhook

From earlier custom Integration page, choose "Incoming Webhook"

Add custom Integration


![Add Configuration](http://i.imgur.com/mwPIcge.png)

Once your at the setting page:

* Choose which channel you want the messages to be posted
* Copy and paste this into [line 10 of app.js](https://github.com/jumbosushi/Go-Outside/blob/master/app.js#L10)
![Imgur](http://i.imgur.com/icyaGkE.png)

Save the setting!

## Add API tokens
As well as adding Clarifai & Instagram API tokens, make sure to configure following variables to your own in app.js!
- "YOUR_ID"
- "YOUR_SECRET"
- "YOUR_URL"
- "YOUR_INCOMING_WEBHOOK_URL"


Aaaaand that's it! Have fun with the game :rocket: !

# Issues
Have a bug? Please create an issue here on GitHub!

# License
Released under the [MIT license](https://github.com/jumbosushi/Go-Outside/blob/master/LICENSE.md)

# Todo
* Turn the app into a slack bot - makes the installation much simpler
* Use [botkit](https://github.com/howdyai/botkit)
* Make Clarifai API call stable
* Edit README to be like [this](https://github.com/CharlieHess/slack-poker-bot)
