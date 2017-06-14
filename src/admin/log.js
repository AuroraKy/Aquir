const Discord = require('discord.js');
const sql = require('sqlite')
sql.open('../data/log.sqlite');

exports.setchannel = (message, command) => {
	
	if(message.channel.type != "text") return failed(message, "Only Available in textchannels");
	let match = message.mentions.channels.first();
	if( match == undefined)
	{
		command = command.split(' ').slice(1).join(' ');
		if(!command) match = message.channel;
		else match = message.guild.channels.find(val => val.name.includes(command));
		if(match == null) return failed(message, "Channel not found");
	}
	console.log(match.id);
	
	sql.get(`SELECT * FROM channellog WHERE serverId ='${message.guild.id}'`).then(row => {
		if (!row) { // Can't find the row.
		  sql.run('INSERT INTO channellog (serverId, channelId, loginfo) VALUES (?, ?, ?)', [message.guild.id, match.id, "ban|unban"]);
		} else { // Can find the row.
		  sql.run(`UPDATE channellog SET channelId = '${match.id}' WHERE serverId = ${message.guild.id}`);
		  let embed = new Discord.RichEmbed();
		  embed.setDescription(`${match.name} is the new log channel`);
		  embed.setColor(3369085);
		  message.channel.send({embed});
		}
	}).catch(() => {
		console.error; 
		sql.run('CREATE TABLE IF NOT EXISTS channellog (serverId TEXT, channelId TEXT, loginfo TEXT)').then(() => {
		  sql.run('INSERT INTO channellog (serverId, channelId, loginfo) VALUES (?, ?, ?)', [message.guild.id, match.id, "ban|unban"]);
		});
	});
};

exports.banAdd = (guild, user) => {
		sql.get(`SELECT * FROM channellog WHERE serverId ='${guild.id}'`).then( row => {
			if (!row) { // Can't find the row.
			  return console.log("Could not find row");
			} else { // Can find the row.
				let channel = guild.channels.get(row.channelId);
				if(!row.loginfo.includes("ban")) return console.log("Log info does not include ban");
				if(channel == undefined)
				{
					channel = guild.id;
					let embed = new Discord.RichEmbed();
					embed.addField("Can't show banned member","Logchannel got deleted");
					embed.setColor("FF3333");
					channel.send({embed});
				}
				else
				{
                    let embed = new Discord.RichEmbed();
                    embed.addField(user.username + " was banned", new Date().toUTCString());
                    embed.addField('User ID',`${user.id}`);
                    embed.setThumbnail(user.avatarURL);
                    embed.setColor("FF3366");
                    channel.send({embed});
				}
			}
		});
};


exports.banRemove = (guild, user) => {
		sql.get(`SELECT * FROM channellog WHERE serverId ='${guild.id}'`).then( row => {
			if (!row) { // Can't find the row.
			  return console.log("Could not find row");
			} else { // Can find the row.
				console.log(row.channelId);
				let channel = guild.channels.get(row.channelId);
				if(!row.loginfo.includes("unban")) return console.log("Log info does not include unban");
				console.log(channel);
				if(channel == undefined)
				{
					channel = guild.id;
					let embed = new Discord.RichEmbed();
					embed.addField("Can't show unbanned member","Logchannel got deleted");
					embed.setColor("FF3333");
					channel.send({embed});
				}
				else
				{
                    let embed = new Discord.RichEmbed();
                    embed.addField(user.username + " was unbanned", new Date().toUTCString());
                    embed.addField('User ID',`${user.id}`);
                    embed.setThumbnail(user.avatarURL);
                    embed.setColor("FF3366");
                    channel.send({embed});
				}
			}
		});
};

function failed(message, reasons) {
	let content = message.cleanContent;
	console.log("Usage of '"+content+"' unsuccessful. Reason(s): "+reasons);
	let embed = new Discord.RichEmbed();
		embed.addField("Usage of '"+content+"' unsuccessful",reasons);
		embed.setColor("FF3333");
		message.channel.send({embed})
}