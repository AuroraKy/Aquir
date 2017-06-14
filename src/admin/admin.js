const Discord = require('discord.js');
//ADMIN

exports.clear = (message, command) => {
		if(message.channel.type == "dm") return failed(message, "Unavailable in Direct Messages");
		message.delete();
		command = command.split(' ').splice(1);
		console.log(command);
		command[0] = parseInt(command[0]);
		command[1] = 0;
		command[2] = 0;
		console.log(command);
		if (command[0] < 2)
		{
			command[1] = -1;
			command[2] = "no messages, minimum 2";
		}
		else if(command[0] > 100)
		{
			command[1] = parseInt((command[0]/100).toFixed(0));
			command[0] = command[0]%100;
			if(command[0] == 1)
				command[0] = 0;
		}
		console.log(command);
		for(var i = 0; i < command[1]+1; i++)
		{
				message.channel.bulkDelete(command[0])
				.catch(console.error);
				command[2] += command[0];
				command[0] = 100;
		}
		console.log(command);
		var embed = new Discord.RichEmbed();
		embed.setDescription("Deleted "+command[2]+" messages");
		embed.setColor(3369085);
		message.channel.send({embed});
		console.log("Deleted "+command[2]+" messages in channel "+message.channel);
};

exports.kick = (message, command, bot) => {
		command = command.split(' ')[0];
		if(message.channel.type != "text") return failed(message, "Kicking is only available in textchannels");
		if(!message.member.hasPermission("KICK_MEMBERS")) return failed(message, "User missing kick permission");
		if(!message.guild.members.get(bot.user.id).hasPermission("KICK_MEMBERS")) return failed(message, "BOT missing kick permission");
		var mentions = message.mentions.users.first();
		if(mentions == undefined)
		{
			command = message.content.replace(command+" ", "");
			console.log(command);
			command = bot.users.find(val => val.username.includes(command));
			if(command == null)
			{
				command = bot.users.get(command);
				if(command == undefined)
				{
					failed(message, "User not found");
					return;
				}
			}
		}
		else
		{
			command = message.mentions.users.first();
		}
			if(command.id == message.guild.ownerID || command.id == bot.user.id)return failed(message, "Unable to kick Server Owner/BOT");
			
			command = message.guild.members.get(command.id);
			if(!command) return	failed(message, "User not found");
			if( message.member.highestRole.comparePositionTo(command.highestRole) < 1) return failed(message, "Your Role is below/equal to target Role");
			if(message.guild.members.get(bot.user.id).highestRole.comparePositionTo(command.highestRole) < 1) return failed(message, "Bot Role is below/equal to target Role");
			console.log(command.user.username + " getting kicked..");
			command.kick()
			.then( 
			() =>
			{
				var embed = new Discord.RichEmbed();
				embed.setDescription("Kicked user "+command.user.username+"!");
				embed.setColor("FF6969");
				message.channel.send({embed})
			})
			.catch(console.error);
};


exports.die = (message, command, bot) => {
		let embed = new Discord.RichEmbed();
		embed.setDescription("Shutting down!");
		embed.setColor("33687D");
		message.channel.send({embed})
		.then(console.log('disconnected'))
		.then((m) => {
			bot.destroy();
			process.exit();
		})
		.catch(console.error);
};

function failed(message, reasons) {
	var content = message.cleanContent;
	console.log("Usage of '"+content+"' unsuccessful. Reason(s): "+reasons);
	var embed = new Discord.RichEmbed();
		embed.addField("Usage of '"+content+"' unsuccessful",reasons);
		embed.setColor("FF3333");
		message.channel.send({embed})
}