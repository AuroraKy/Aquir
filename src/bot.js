const Discord = require('discord.js');
var commands, utility, admin, log, help, music;
load();
function load()
{
utility = require('./utility/utility.js');
admin = require('./admin/admin.js');
log = require('./admin/log.js');
help = require('./help/help.js');
music = require('./music/music.js');
commands = new Discord.Collection([["play", { 
		alias: "play",
		info: "**plays a song from keywords**",
		category: [ "music" , "music" ],
		run: music.play
}],["skip", { 
		alias: "skip",
		info: "**skips a song**",
		usage: ">>skip",
		category: [ "music" , "music" ],
		run: music.skip
}],["nowplaying", { 
		alias: "nowplaying-np",
		info: "**Shows song currently playing**",
		category: [ "music" , "music" ],
		run: music.np
}],["queue", { 
		alias: "queue-q",
		info: "**Shows queue**",
		category: [ "music" , "music" ],
		run: music.queue
}],["destroy", { 
		alias: "destroy-d",
		info: "**Destroys connection**",
		category: [ "music" , "music" ],
		run: music.destroy
}],["repeatcurrentsong", { 
		alias: "rpc-repeatcurrentsong",
		info: "**Repeats current song**",
		category: [ "music" , "music" ],
		run: music.rpc
}],["mood", { 
		alias: "mood",
		info: "**Shows current mood of the Bot**",
		category: [ "utility" , "utility" ],
		run: utility.mood
}],["ping", {
		alias: "ping",
		info: "**Pong! Check latency issues**",
		category: [ "utility" , "utility" ],
		run: utility.ping
}],["userid", {
		alias: "userid-uid",
		info: "**Shows user ID**",
		category: [ "utility" , "utility" ],
		run: utility.uid
}],["roleid", {
		alias: "roleid-rid",
		info: "**Shows role ID**",
		category: [ "utility" , "utility" ],
		run: utility.rid
}],["channelid", {
		alias: "channelid-cid",
		info: "**not yet finished**",
		category: [ "utility" , "utility" ],
		run: utility.cid
}],["credit", {
		alias: "credit-credits",
		info: "**Shows Credits**",
		category: [ "help" , "help" ],
		run: help.credit
}],["help", {
		alias: "help-h",
		info: "**.. no comments**",
		category: [ "help" , "help" ],
		run: help.help
}],["clear", {
		alias: "clear-cls",
		info: "**Deletes 2 to 100 messages.**",
		category: [ "admin" , "admin" ],
		run: admin.clear
}],["setchannel", {
		alias: "setchannel-setlogchannel",
		info: "**Sets the Log channel**",
		category: [ "admin" , "log" ],
		run: log.setchannel
}],["kick", {
		alias: "kick-k",
		info: "**kicks User**",
		category: [ "admin" , "admin" ],
		run: admin.kick
}],["die", {
		alias: "die-sd-shutdown-destroy",
		info: ">>die | >>destroy - **Makes you a BOT murderer. Owner-only**\n>>shutdown | >>sd - **Peacefully shuts the BOT down~!**",
		category: [ "admin" , "admin" ],
		custominfo: true,
		owneronly: true,
		run: admin.die
}],["reload", {
		alias: "reload",
		info: "**Reloads a module**",
		category: null,
		run: reload
}],["<<eval", {
		alias: "<<eval",
		info: null,
		category: null,
		run: evalf
}]]);
}

const bot = new Discord.Client();

const config = require('./config.json');

exports.commands = commands;
exports.config = config;
// if( alias.split('-').indexOf(command) > -1 )
// if( config.ownerids.indexOf(message.author.id) < 0)
bot.on('ready', () => {
  console.log('I am ready!');
  bot.user.setGame(`on ${bot.guilds.size} guilds.. yay c:`);
});

bot.on('guildBanAdd', (guild, user) => { log.banAdd(guild, user)});
bot.on('guildBanRemove', (guild, user) => { log.banRemove(guild, user)});

bot.on('message', message => {
  if(message.author.bot) return;
	var command = message.content;
	if(message.channel.type == "dm") console.log("[DM]"+message.author.username + " -> " + command);
  if(command.startsWith(config.prefix)) //has prefix
  {
	command = command.replace(config.prefix,""); //remove prefix
	let findcmd = command.split(' ')[0];
	findcmd = commands.find(val => val.alias.split('-').indexOf(findcmd.toLowerCase()) > -1);
	console.log(findcmd);
	if(!findcmd) return console.log("Unable to find command");
	if(findcmd.owneronly)
		if( config.ownerids.indexOf(message.author.id) < 0) failed(message, "Owner-only");
	findcmd.run(message, command, bot);
  }
});

bot.login(config.token);

function clean(text) {
  if (typeof(text) === 'string')
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
  else
      return text;
}

function failed(message, reasons) {
	var content = message.cleanContent;
	console.log("Usage of '"+content+"' unsuccessful. Reason(s): "+reasons);
	var embed = new Discord.RichEmbed();
		embed.addField("Usage of '"+content+"' unsuccessful",reasons);
		embed.setColor("FF3333");
		message.channel.send({embed});
}

// function pluck(array){
 // return array.map(function(item) { return item['name']; });
// }

// function hasRole(mem, role){
  // return pluck(mem.roles).includes(role);
// }

function evalf(message, command) 
{
	try {
		  const code = command.replace('<<eval ',"");
		  console.log("trying to evaluate " + code);
		  let evaled = eval(code);

		  if (typeof evaled !== 'string')
			evaled = require('util').inspect(evaled);

		  message.channel.send(clean(evaled), {code:'xl'});
		} catch (err) {
		  message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}

}

function reload(message, command)
{
		let args = command.split(' ').slice(1);
		if(args[1] == undefined)
			args = findModule(args[0])
		if(args == null) return failed(message, 'This module is not reloadable. Use >>shutdown instead');
		if(args[0] == undefined || args[1] == undefined|| args.size < 1) 
			return failed(message, 'Must provide a command/module name to reload.');
		console.log(require.cache[require.resolve(`./${args[0]}/${args[1]}.js`)]);
		try { 
		delete require.cache[require.resolve(`./${args[0]}/${args[1]}.js`)];
		}
		catch (exception) { return failed(message, exception);}
		load();
		message.reply(`The module ${args[0]}/${args[1]} has been reloaded`);
}

function findModule(command) 
{
	let findcmd = commands.find(val => val.alias.split('-').indexOf(command.toLowerCase()) > -1);
	if(!findcmd)
	{
		findcmd = commands.find(val => {if(val.category) return val.category.indexOf(command.toLowerCase()) > -1});
		if(!findcmd) return [ undefined , undefined ];
	}
	console.log(`Reloading ${findcmd.category}`);
	return findcmd.category;
	
}