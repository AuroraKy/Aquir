const Discord = require('discord.js');
//HELP
const main = require('../bot.js');
// exports.help = (message) => { //made by Angelic Bunny Ryiah#9483[265642040950390784]
	// let commands = main.commands;
	// let config = main.config;
	// var embed = new Discord.RichEmbed();
	// embed.setTitle("Help!");
	// embed.setDescription("Ahem, Hi.");
	// embed.addField("Help ", ">>help - **.. no comments!**\n>>credits | >>credit - **Shows Credits**",0);
	// embed.addField("Utility", ">>ping - **Pong! Check latency issues.**\n>>userid | >>uid - **Shows user ID**\n>>roleid | >>rid - **Shows role ID**",0);
	// embed.addField("Admin", ">>clear | >>cls - **Deletes 2 to 100 messages.**\n>>kick | >>k - **Kicks user**",0);
	// embed.addField("Owner", ">>die | >>destroy - **Makes you a BOT murderer.**\n>>shutdown | >>sd - **Peacefully shuts the BOT down~!**",0);
	// embed.setColor("a64dff");
	// embed.setFooter("Help! Made by Ryiah");
	// message.channel.send({embed});
// };
var embed = null;
exports.help = (message) => { //allkindsofbroken right now
	let commands = main.commands;
	let findcmd = message.content.split(' ')[1];
	if(findcmd)
		findcmd = commands.find(val => val.alias.split('-').indexOf(findcmd.toLowerCase()) > -1);
	if(findcmd)
	{
		if(findcmd.category == null) return;
		let out = findcmd.info;
		out += (findcmd.usage == undefined) ? "" : `\nUsage: ${findcmd.usage}`;
		console.log(out);
		let cmd = new Discord.RichEmbed();
		cmd.setDescription(findcmd.category.join(' - '));
		cmd.addField(`>>${findcmd.alias.split('-').join(' | >>')}`,`\u200B${out}`);
		cmd.setColor("a64dff");
		cmd.setFooter("Help! Made by Ryiah, build upon by Aurora");
		return message.channel.send({embed: cmd});
	}
	//let config = main.config;
	if(embed == null)
	{
	let outputarr = [ undefined ];
	commands.forEach(function(value, key) {
		// if(value.category != null)
			// console.log(key + ' = ' + value.category[1]);
		// else
			// console.log(key + ' = ' + value.category);
		if(value.category != null)
		{
			
			
			for(var i = 0; i <= outputarr.length; i++)
			{
				if(outputarr[i] == undefined)
				{
					outputarr[i] = value.category.slice();//, value.custominfo , value.alias , value.info , value.owneronly ];
					if(value.custominfo)
						outputarr[i][2] = value.info.slice();
					else
					{
						outputarr[i][2] = ">>" + value.alias.split("-").join(" | >>") + " - " + value.info.slice();;
					}
					if(value.owneronly)
						outputarr[i][2] += " **Owner-only**";
					outputarr[i][2] += "\n";
					break;
				}
				else if(outputarr[i][1] == value.category[1].slice())
				{
					if(value.custominfo)
						outputarr[i][2] += value.info.slice();
					else
					{
						outputarr[i][2] += ">>" + value.alias.split("-").join(" | >>") + " - " + value.info.slice();
					}
					if(value.owneronly)
						outputarr[i][2] += " **Owner-only**";
					outputarr[i][2] += "\n";
					break;
				}
				
			}
		}
	});
	embed = new Discord.RichEmbed();
	embed.setDescription("Help");
	let len = outputarr.length;
	for(var i = 0; i < len ; i++)
	{
	embed.addField(`${outputarr[i][0]} - ${outputarr[i][1]}`,outputarr[i][2]);
	}
	embed.setColor("a64dff");
	embed.setFooter("Help! Made by Ryiah, build upon by Aurora");
	}
	message.channel.send({embed});
};


exports.credit = (message) => {
	var embed = new Discord.RichEmbed();
	embed.setTitle("Credits");
	embed.addField("Made by:","Aurora",1);
	embed.addField("Contributor","Ryiah:\nHelp and moral support",1);
	embed.addField("Libraries used:","[discord.js](discord.js.org)");
	embed.setColor("F0CCFF");
	message.channel.send({embed});
};