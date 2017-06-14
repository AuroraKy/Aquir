const Discord = require('discord.js');
//UTILITY

// var start = process.hrtime();

// var elapsed_time = function(note){
    // var precision = 3; // 3 decimal places
    // var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    // console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    // start = process.hrtime(); // reset the timer
// }
var mood = ["lewd x:","happy c:","neutral o-o","sad ;w;","depressed .w."][Math.floor(Math.random()*5)];
exports.mood = (message) => {
	message.reply("I currently feel "+mood);
};

exports.ping = (message) => {
	console.log("pinged on "+message.guild.name);
    message.reply('pong')
	.then(m => { m.edit(`${m.content} - ${m.createdTimestamp - message.createdTimestamp} ms.`);})
	.catch(console.error);
};

exports.uid = (message, command, bot) => {
	let name;
	let match = message.mentions.users.first();
	if(match == undefined)
	{
		command = command.split(' ').slice(1).join(' ');
		if(!command) match = message.author;
		else match = bot.users.find(val => val.username.toLowerCase().includes(command.toLowerCase())); //test
		if(match == null) return failed(message, "User not found");
	}
	if(message.channel.type == "text")
	{
		name = message.channel.guild.members.get(match.id);
		if(name != undefined)
			name = name.displayName;
		console.log(match.username);
	}
	if(match.id == "265642040950390784")
		name = "Lovely Goddess <3";
	if(name == undefined) name = match.username;
	let embed = new Discord.RichEmbed();
		embed.addField(`Role id of ${name}`,match.id);
		embed.setColor(3369085);
		message.channel.send({embed});
};

exports.rid = (message, command) => {
	if(message.channel.type != "text") return failed(message, "Only Available in textchannels");
	let match = message.mentions.roles.first();
	if(match == undefined)
	{
		command = command.split(' ').slice(1).join(' ');
		match = message.guild.roles.find(val => val.name.toLowerCase().includes(command.toLowerCase()));
		if(match == null) return failed(message, "Role not found");
	}
	let embed = new Discord.RichEmbed();
		embed.addField(`Role id of ${match.name}`,match.id);
		embed.setColor(3369085);
		message.channel.send({embed})
};

exports.cid = (message, command, bot) => {
	if(message.channel.type != "text") return failed(message, "Only Available in textchannels");
	let match = message.mentions.channels.first();
	if( match == undefined)
	{
		command = command.split(' ').slice(1).join(' ');
		if(!command) match = message.channel;
		else match = message.guild.channels.find(val => val.name.toLowerCase().includes(command.toLowerCase()));
		if(match == null) return failed(message, "Channel not found");
	}
	let embed = new Discord.RichEmbed();
		embed.addField(`Channel id of ${match.name}`,match.id);
		embed.setColor(3369085);
		message.channel.send({embed})
};

function failed(message, reasons) {
	let content = message.cleanContent;
	console.log("Usage of '"+content+"' unsuccessful. Reason(s): "+reasons);
	let embed = new Discord.RichEmbed();
		embed.addField("Usage of '"+content+"' unsuccessful",reasons);
		embed.setColor("FF3333");
		message.channel.send({embed})
}