const Discord = require('discord.js');
const config = require('../config.json');
const c4r = require('./connect4Reactions.js');
// // Await !vote messages
// const filter = m => m.content.startsWith('!vote');
// // Errors: ['time'] treats ending because of the time limit as an error
// channel.awaitMessages(filter, { max: 4, time: 60000, errors: ['time'] })
 // .then(collected => console.log(collected.size))
 // .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));
 let startedChans = new Discord.Collection();
exports.start = (message, command) =>
{
	if(message.channel.type != "text") return failed(message, "Only available in text channels");
	if(command.toLowerCase().includes("react")) return c4r.start(message, command);
	if(!command.split(' ').slice(1).join(' ').startsWith("start")) return console.log("used c4 without start");
	start = startedChans.get(message.channel.id);
	console.log(start);
	if(start != undefined)
	{
	if(start.started) return message.reply("Game already started.\nJoin by using "+config.prefix+"c4 join instead of start");
	}
	else startedChans.set(message.channel.id, {started: true});
	
	let user1 = message.author;
	message.channel.send(user1 + " started a connect 4 game\nJoin with "+config.prefix+"c4 join");
	let user2;
	let filter = m => m.content.split(' ').slice(1).join(' ').startsWith("join"); //&& m.author != user1;
	message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time']})
	.then(collected => {
		user2 = collected.first().author;
		collected.first().channel.send(user2 + " joined");
		message.channel.send("Attempting to start game")
		.then(msg => game(message, user1, user2, user1, msg));
	})
	.catch(collected => {
		console.log(collected);
		message.channel.send("Game canceled, no one joined.");
		startedChans.delete(message.channel.id);
	});
};

function game(message, user1, user2, turn, lastmessage, field) {
	if(field == undefined)
		field = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
	let out = "";
	for(let i = 0; i < 6; i++)
	{
	out += "\n";
		for(let j = 0; j < 7; j++)
			out += (field[i][j] === 0) ? "⚪" : (field[i][j] === 1) ? "🔵" : "🔴";
	}
	lastmessage.delete(1000);
	message.channel.send("Current turn: "+ turn + out).then(msg =>{
	lastmessage = msg
	lastmessage.react("1⃣").then(() => lastmessage.react("2⃣")).then(() => lastmessage.react("3⃣")).then(() => lastmessage.react("4⃣")).then(() => lastmessage.react("5⃣")).then(() => lastmessage.react("6⃣")).then(() => lastmessage.react("7⃣"));
	});
	let filter =  m => (/[0-7]/.test(m.content) && m.author == turn) || m.content.includes("end") && (m.author == user1 || m.author == user2);
	message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time']})
	.then(collected => {
	if(collected.first(0).content.includes("end"))
	{
	startedChans.delete(message.channel.id);
	return message.channel.send("Ended");
	}
	let choice = /\d/.exec(collected.first().content)[0]-1;
	for(let i = 5; i > -2; i--)
	{
		if( i == -1) 
		{
			message.channel.send("Invalid choice "+turn);
			game(message, user1, user2, turn, () => lastmessage, field);
		}
		else if( field[i][choice] === 0)
		{
			field[i][choice] = (turn == user1) ? 1 : 2;
			break;
		}
	}
	console.log(field);
	let win = checkWin(field);
	console.log("Winner:"+win);
	if(win != 0)
	{
		let out = "";
		for(let i = 0; i < 6; i++)
		{
		out += "\n";
			for(let j = 0; j < 7; j++)
				out += (field[i][j] === 0) ? "⚪" : (field[i][j] === 1) ? "🔵" : "🔴";
		}
		() => lastmessage.delete(300);
		let embed = new Discord.RichEmbed();
		embed.setDescription(((win === 1) ? user1 : (win === 2) ? user2 : "No one" ) +" won.");
		embed.addField("\u200B",out);
		embed.setColor(((win === 1) ? "BLUE" : (win === 2) ? "RED" : "PURPLE" ));
		message.channel.send({embed});
		return startedChans.delete(message.channel.id);
	}
	else
		game(message, user1, user2, (turn != user1) ? user1 : user2, () => lastmessage, field);
	})
	.catch(collected => {
	console.log(collected);
	message.channel.send("Time ran out, " + ((turn == user1) ? user1 : user2) + " won.").catch(()=>console.log("the message that says who won by default failed"));
	startedChans.delete(message.channel.id);
	});
}

function checkWin(field)
{
	// [ [ 0, 0, 0, 1, 0, 0, 0 ],   0
	  // [ 0, 0, 1, 0, 0, 0, 0 ],   1
	  // [ 0, 1, 0, 0, 0, 0, 1 ],   2
	  // [ 1, 0, 0, 0, 0, 1, 0 ],   4
	  // [ 0, 0, 0, 0, 1, 0, 0 ],   3
	  // [ 0, 0, 0, 1, 0, 0, 0 ] ]  5
	  //   0  1  2  3  4  5  6   j  i
	let count1 = 0;
	let count2 = 0;
	// checking rows
	console.log("checking rows");
	for(let i = 0; i < 6; i++)
	{
		for(let j = 0; j < 7; j++)
		{
			count1 = (field[i][j] === 1) ? count1 + 1 : 0;
			count2 = (field[i][j] === 2) ? count2 + 1 : 0;
			if(count1 >= 4)
				return 1;
			else if (count2 >= 4)
				return 2;
		}
		count1 = 0;
		count2 = 0;
		console.log("checked row " + i);
	}
	// checking collums
	console.log("checking collums");
	for(let i = 0; i < 7; i++)
	{
		for(let j = 0; j < 6; j++)
		{
			count1 = (field[j][i] === 1) ? count1 + 1 : 0;
			count2 = (field[j][i] === 2) ? count2 + 1 : 0;
			if(count1 == 4)
				return 1;
			else if (count2 == 4)
				return 2;
		}
		count1 = 0;
		count2 = 0;
		console.log("checking collum " + i);
	}
	// checking diagonal "\"
	console.log("checking diagonally");
	let trueI, trueJ;
	for(let i = -2; i < 4; i++)
	{
			trueI = (i < 0 ) ? i *-1 : 0;
			trueJ = (i < 0 ) ? 0 : i;
		for(let j = 0; j < 6; j++)
		{
            if(field[trueI+j] == undefined)
                break;
			else if(field[trueI+j][trueJ+j] == undefined)
				break;
			
			count1 = (field[trueI+j][trueJ+j] === 1) ? count1 + 1 : 0;
			count2 = (field[trueI+j][trueJ+j] === 2) ? count2 + 1 : 0;
			if(count1 == 4)
				return 1;
			else if (count2 == 4)
				return 2;
		}
		count1 = 0;
		count2 = 0;
		console.log("checking ["+trueI+"]["+trueJ+"] diagonally");
	}
	//   3 -> 4 -> 5 -> 6 -> 6 -> 6 j
	//   0 -> 0 -> 0 -> 0 -> 1 -> 2 i
	// checking counter diagonal "/" NOT DONE YET
	console.log("checking anti-diagonally");
	for(let i = 3; i < 9; i++)
	{
			trueI = (i > 6) ? i-6: 0;
			trueJ = (i > 6 ) ? 6 : i;
		for(let j = 0; j < 6; j++)
		{
            if(field[trueI-j] == undefined)
                break;
			else if(field[trueI-j][trueJ-j] == undefined)
				break;
			
			count1 = (field[trueI-j][trueJ-j] === 1) ? count1 + 1 : 0;
			count2 = (field[trueI-j][trueJ-j] === 2) ? count2 + 1 : 0;
			if(count1 == 4)
				return 1;
			else if (count2 == 4)
				return 2;
		}
		count1 = 0;
		count2 = 0;
		console.log("checking ["+trueI+"]["+trueJ+"] anti-diagonally");
	}
	console.log("Checking for draw")
	for(let i = 0; i < 7; i++)
	{
		count1 = (field[0][i] != 0) ? count1+1 : 0;
		
		if(count1 == 7)
			return -1;
	}
	console.log("checked all?");
	return 0;
}


function failed(message, reasons) {
	let content = message.cleanContent;
	console.log("Usage of '"+content+"' unsuccessful. Reason(s): "+reasons);
	let embed = new Discord.RichEmbed();
		embed.addField("Usage of '"+content+"' unsuccessful",reasons);
		embed.setColor("FF3333");
		message.channel.send({embed})
}